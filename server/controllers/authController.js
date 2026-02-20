const prisma = require('../lib/prisma');
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/email');
const { AppError } = require('../middleware/errorHandler');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { logger, logActivity } = require('../utils/logger');

// Password hashing helper
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// 1. Register User
exports.register = async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName, companyName } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUser) {
      return next(new AppError('Email already registered', 400));
    }

    const hashedPassword = await hashPassword(password);
    const rawToken = crypto.randomBytes(32).toString('hex');
    const verificationToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); 

    const userRole = role ? role.toUpperCase() : 'CANDIDATE';

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          passwordHash: hashedPassword,
          role: userRole,
          firstName,
          lastName,
          isVerified: false,
          emailVerificationToken: verificationToken,
          emailVerificationExpires: verificationExpires,
        },
      });

      if (role && role.toLowerCase() === 'candidate') {
        await tx.candidateProfile.create({ data: { userId: newUser.id } });
      } else if (role && role.toLowerCase() === 'employer') {
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

    // ID-ን ወደ Number ቀይሮ መላክ (Type fix)
    await logActivity(Number(user.id), 'register', 'user', String(user.id), { role }, req.ip, req.get('User-Agent'));

    try {
      const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${rawToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - SimuAI',
        html: `<h1>Welcome!</h1><p>Please verify your email: <a href="${verificationUrl}">Verify Email</a></p>`
      });
    } catch (emailError) {
      logger.warn('Failed to send verification email', { email: user.email, error: emailError.message });
    }

    res.status(201).json({
      success: true,
      token: generateToken({ id: user.id, role: user.role }),
      refreshToken: generateRefreshToken({ id: user.id }),
      user: { 
        id: String(user.id), 
        email: user.email, 
        role: user.role.toLowerCase(),
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isVerified,
        isActive: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Login User
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ 
      where: { email: normalizedEmail },
      select: {
        id: true, email: true, passwordHash: true, role: true, 
        firstName: true, lastName: true,
        isLocked: true, loginAttempts: true, isVerified: true
      }
    });
    
    if (!user) return next(new AppError('Invalid credentials', 401));
    if (user.isLocked) return next(new AppError('Account is locked', 403));

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    
    if (!isMatch) {
      const newAttempts = user.loginAttempts + 1;
      await prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: newAttempts, isLocked: newAttempts >= 5 }
      });
      return next(new AppError('Invalid credentials', 401));
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { loginAttempts: 0, lastLogin: new Date() }
    });

    await logActivity(Number(user.id), 'login', 'user', String(user.id), {}, req.ip, req.get('User-Agent'));

    res.json({
      success: true,
      token: generateToken({ id: user.id, role: user.role }),
      refreshToken: generateRefreshToken({ id: user.id }),
      user: { 
        id: String(user.id), 
        email: user.email, 
        role: user.role.toLowerCase(),
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        isEmailVerified: user.isVerified,
        isActive: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3. Forgot Password
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) return next(new AppError('No user found with this email', 404));

    const rawToken = crypto.randomBytes(32).toString('hex');
    const resetToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: resetToken, resetPasswordExpires: new Date(Date.now() + 3600000) }
    });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
    await sendEmail({ to: user.email, subject: 'Password Reset', html: `<a href="${resetUrl}">Reset Password</a>` });

    res.json({ success: true, message: 'Reset link sent' });
  } catch (error) {
    next(error);
  }
};

// 4. Reset Password
exports.resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: hashedToken, resetPasswordExpires: { gt: new Date() } }
    });

    if (!user) return next(new AppError('Invalid or expired token', 400));

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(password),
        resetPasswordToken: null,
        resetPasswordExpires: null,
        isLocked: false,
        loginAttempts: 0
      }
    });

    await logActivity(Number(user.id), 'password_reset', 'user', String(user.id), {}, req.ip, req.get('User-Agent'));
    res.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

// 5. Verify Email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: { emailVerificationToken: hashedToken, emailVerificationExpires: { gt: new Date() } }
    });

    if (!user) return next(new AppError('Invalid token', 400));

    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true, emailVerificationToken: null, emailVerificationExpires: null }
    });

    await logActivity(Number(user.id), 'email_verified', 'user', String(user.id), {}, req.ip, req.get('User-Agent'));
    res.json({ success: true, message: 'Email verified' });
  } catch (error) {
    next(error);
  }
};

// 6. Resend Verification (ይህ ስላልነበረ ነው አፑ የቆመው)
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

    if (!user) return next(new AppError('User not found', 404));
    if (user.isVerified) return next(new AppError('Email already verified', 400));

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
    await sendEmail({ to: user.email, subject: 'Verify Email', html: `<a href="${verificationUrl}">Verify Now</a>` });

    res.json({ success: true, message: 'Verification email sent' });
  } catch (error) {
    next(error);
  }
};

// 7. Refresh Token
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

// 8. Logout
exports.logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};