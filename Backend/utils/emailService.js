/**
 * Email Service for sending emails to users
 * Uses Nodemailer for production and logs to console in development
 */
const nodemailer = require('nodemailer');

// Create a transporter once for reuse
let transporter;

// Initialize transporter based on environment
if (process.env.NODE_ENV === 'production') {
  // Production email setup
  transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
} else {
  // Development - just log to console
  console.log('[EMAIL SERVICE] Running in development mode - emails will be logged to console');
}

/**
 * Send OTP to user's email
 * @param {string} email - User's email address
 * @param {string} otp - One-time password to send
 * @returns {Promise<boolean>} - Returns true if email was sent successfully
 */
exports.sendOTPEmail = async (email, otp) => {
  try {
    console.log(`[EMAIL SERVICE] Sending OTP email to ${email}`);
    
    if (process.env.NODE_ENV === 'production') {
      // Send actual email in production
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Verification Code for SpacECE',
        text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Email Verification</h2>
            <p>Thank you for registering with SpacECE Digital Transformation solution.</p>
            <p>Your verification code is: <strong style="font-size: 18px; background: #f4f4f4; padding: 5px 10px; border-radius: 4px;">${otp}</strong></p>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
    } else {
      // Development mode - just log the OTP
      console.log(`[EMAIL SERVICE] OTP: ${otp}`);
    }
    
    return true;
  } catch (error) {
    console.error('[EMAIL SERVICE] Error sending email:', error);
    return false;
  }
};

/**
 * Send welcome email to new user
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @returns {Promise<boolean>} - Returns true if email was sent successfully
 */
exports.sendWelcomeEmail = async (email, name) => {
  try {
    console.log(`[EMAIL SERVICE] Sending welcome email to ${email}`);
    
    if (process.env.NODE_ENV === 'production') {
      // Send actual email in production
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to SpacECE Digital Transformation',
        text: `Hello ${name}, welcome to SpacECE! Thank you for joining our platform for early childhood development.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to SpacECE!</h2>
            <p>Hello ${name},</p>
            <p>Thank you for joining SpacECE Digital Transformation platform. We're excited to have you on board!</p>
            <p>Our platform helps support early childhood development through tracking milestones, planning activities, and connecting parents with volunteers.</p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br>The SpacECE Team</p>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
    } else {
      // Development mode - just log
      console.log(`[EMAIL SERVICE] Hello ${name}, welcome to SpacECE!`);
    }
    
    return true;
  } catch (error) {
    console.error('[EMAIL SERVICE] Error sending welcome email:', error);
    return false;
  }
};

/**
 * Send password reset email
 * @param {string} email - User's email address
 * @param {string} resetToken - Password reset token
 * @returns {Promise<boolean>} - Returns true if email was sent successfully
 */
exports.sendPasswordResetEmail = async (email, resetToken) => {
  try {
    console.log(`[EMAIL SERVICE] Sending password reset email to ${email}`);
    
    if (process.env.NODE_ENV === 'production') {
      // Create reset URL
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      
      // Send actual email in production
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Please go to this link to reset your password: ${resetUrl}. This link is valid for 10 minutes.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password.</p>
            <p>Please click the button below to reset your password:</p>
            <div style="margin: 20px 0;">
              <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 14px 20px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px;">Reset Password</a>
            </div>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>This link is valid for <strong>10 minutes</strong>.</p>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
    } else {
      // Development mode - just log
      console.log(`[EMAIL SERVICE] Reset token: ${resetToken}`);
      console.log(`[EMAIL SERVICE] Reset URL would be: ${process.env.CLIENT_URL}/reset-password/${resetToken}`);
    }
    
    return true;
  } catch (error) {
    console.error('[EMAIL SERVICE] Error sending password reset email:', error);
    return false;
  }
};
