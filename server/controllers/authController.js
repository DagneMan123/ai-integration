const prisma = require('../lib/prisma');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/email');
const { AppError } = require('../middleware/errorHandler');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { logger, logActivity } = require('../utils/logger'); // logActivity ተጨምሯል

// Password hashing helper
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Register user
exports.register = async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName, companyName } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    const hashedPassword = await hashPassword(password);
    const rawToken = crypto.randomBytes(32).toString('hex');
    const verificationToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    // Convert role to uppercase for enum
    const userRole = role ? role.toUpperCase() : 'CANDIDATE';

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          role: userRole,
          firstName,
          lastName,
          isVerified: false,
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
        },
      });

      if (role === 'candidate') {
        await tx.candidateProfile.create({
          data: { userId: newUser.id }
        });
      } else if (role === 'employer') {
        await tx.company.create({
          data: {
            name: companyName || `${firstName}'s Company`,
            createdById: newUser.id,
            isVerified: false
          }
        });
      }
      return newUser;
    });

    // Log Activity
    await logActivity(user.id, 'register', 'user', user.id, { role }, req.ip, req.get('User-Agent'));

    // Try to send verification email (don't fail registration if email fails)
    try {
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;
      await sendEmail({
        to: email,
        subject: 'Verify Your Email - SimuAI',
        html: `<h1>Welcome!</h1><p>Please verify your email: <a href="${verificationUrl}">Verify Email</a></p>`
      });
    } catch (emailError) {
      logger.warn('Failed to send verification email', { email, error: emailError.message });
      // Continue with registration even if email fails
    }

    const token = generateToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role.toLowerCase() }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ 
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        role: true,
        firstName: true,
        lastName: true,
        isLocked: true,
        loginAttempts: true,
        isVerified: true
      }
    });
    
    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    if (!user.passwordHash) {
      logger.error('User has no password', { email });
      return next(new AppError('Invalid credentials', 401));
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    
    if (!isPasswordValid) {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          loginAttempts: { increment: 1 },
          isLocked: user.loginAttempts + 1 >= 5 ? true : false
        }
      });
      return next(new AppError('Invalid credentials', 401));
    }

    if (user.isLocked) {
      return next(new AppError('Account is locked', 403));
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lastLogin: new Date() }
    });

    // Log Activity
    await logActivity(user.id, 'login', 'user', user.id, {}, req.ip, req.get('User-Agent'));

    const token = generateToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    res.json({
      success: true,
      token,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role.toLowerCase(), firstName: user.firstName, lastName: user.lastName }
    });
  } catch (error) {
    next(error);
  }
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return next(new AppError('No user found', 404));

    const rawToken = crypto.randomBytes(32).toString('hex');
    const resetToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: new Date(Date.now() + 3600000) 
      }
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
    await sendEmail({ to: email, subject: 'Password Reset', html: `<a href="${resetUrl}">Reset Password</a>` });

    res.json({ success: true, message: 'Reset link sent' });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() }
      }
    });

    if (!user) return next(new AppError('Invalid or expired token', 400));

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hashPassword(password),
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    await logActivity(user.id, 'password_reset', 'user', user.id, {}, req.ip, req.get('User-Agent'));

    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

// Verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { gt: new Date() }
      }
    });

    if (!user) return next(new AppError('Invalid or expired token', 400));

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, emailVerificationToken: null, emailVerificationExpires: null }
    });

    await logActivity(user.id, 'email_verified', 'user', user.id, {}, req.ip, req.get('User-Agent'));

    res.json({ success: true, message: 'Email verified' });
  } catch (error) {
    next(error);
  }
};

// FIXED: Added missing resendVerification function
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return next(new AppError('User not found', 404));
    if (user.isEmailVerified) return next(new AppError('Email already verified', 400));

    const rawToken = crypto.randomBytes(32).toString('hex');
    const verificationToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: verificationToken,
        emailVerificationExpires: new Date(Date.now() + 24 * 60 * 60 * 1000)
      }
    });

    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;
    await sendEmail({
      to: email,
      subject: 'Verify Your Email - SimuAI',
      html: `<p>Please verify your email: <a href="${verificationUrl}">Verify Email</a></p>`
    });

    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(new AppError('Refresh token required', 400));

    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user) return next(new AppError('User not found', 404));

    res.json({
      success: true,
      token: generateToken({ id: user.id, role: user.role }),
      refreshToken: generateRefreshToken({ id: user.id })
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out' });
};