const nodemailer = require('nodemailer');
const { logger } = require('./logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send verification email
const sendVerificationEmail = async (email, firstName, verificationToken) => {
  try {
    const transporter = createTransporter();
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `"SimuAI Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your SimuAI Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to SimuAI!</h2>
          <p>Hi ${firstName},</p>
          <p>Thank you for registering with SimuAI. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This verification link will expire in 24 hours.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            If you didn't create an account with SimuAI, please ignore this email.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info('Verification email sent', { email });
  } catch (error) {
    logger.error('Failed to send verification email', { email, error: error.message });
    throw error;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, firstName, resetToken) => {
  try {
    const transporter = createTransporter();
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: `"SimuAI Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset Your SimuAI Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>Hi ${firstName},</p>
          <p>We received a request to reset your password for your SimuAI account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This reset link will expire in 1 hour.</p>
          <p><strong>If you didn't request this password reset, please ignore this email and your password will remain unchanged.</strong></p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            For security reasons, this link can only be used once.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info('Password reset email sent', { email });
  } catch (error) {
    logger.error('Failed to send password reset email', { email, error: error.message });
    throw error;
  }
};

// Send interview completion notification
const sendInterviewCompletionEmail = async (email, firstName, interviewResult) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SimuAI Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your SimuAI Interview Results',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Interview Completed!</h2>
          <p>Hi ${firstName},</p>
          <p>Congratulations on completing your AI interview! Here's a summary of your performance:</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Results:</h3>
            <p><strong>Overall Score:</strong> ${interviewResult.overall_score}/100</p>
            <p><strong>Technical Score:</strong> ${interviewResult.technical_score}/100</p>
            <p><strong>Communication Score:</strong> ${interviewResult.communication_score}/100</p>
            <p><strong>Recommendation:</strong> ${interviewResult.recommendation}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/candidate/interviews" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Detailed Report
            </a>
          </div>
          <p>Keep practicing to improve your interview skills!</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Thank you for using SimuAI for your interview preparation.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info('Interview completion email sent', { email });
  } catch (error) {
    logger.error('Failed to send interview completion email', { email, error: error.message });
    throw error;
  }
};

// Send payment confirmation email
const sendPaymentConfirmationEmail = async (email, firstName, paymentDetails) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SimuAI Platform" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Payment Confirmation - SimuAI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #16a34a;">Payment Successful!</h2>
          <p>Hi ${firstName},</p>
          <p>Your payment has been successfully processed. Here are the details:</p>
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #16a34a;">
            <h3 style="margin-top: 0; color: #16a34a;">Payment Details:</h3>
            <p><strong>Invoice Number:</strong> ${paymentDetails.invoice_number}</p>
            <p><strong>Amount:</strong> ${paymentDetails.amount} ${paymentDetails.currency}</p>
            <p><strong>Payment Method:</strong> ${paymentDetails.payment_method}</p>
            <p><strong>Transaction Reference:</strong> ${paymentDetails.transaction_reference}</p>
            <p><strong>Date:</strong> ${new Date(paymentDetails.processed_at).toLocaleDateString()}</p>
          </div>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.CLIENT_URL}/payments" 
               style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Payment History
            </a>
          </div>
          <p>Thank you for your payment!</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">
            Keep this email as a receipt for your records.
          </p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    logger.info('Payment confirmation email sent', { email });
  } catch (error) {
    logger.error('Failed to send payment confirmation email', { email, error: error.message });
    throw error;
  }
};

// Generic send email function
const sendEmail = async ({ to, subject, html }) => {
  try {
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      logger.warn('Email not configured, skipping email send', { to, subject });
      return;
    }

    const transporter = createTransporter();
    const mailOptions = {
      from: `"SimuAI Platform" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    };

    await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', { to, subject });
  } catch (error) {
    logger.error('Failed to send email', { to, subject, error: error.message });
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendInterviewCompletionEmail,
  sendPaymentConfirmationEmail
};