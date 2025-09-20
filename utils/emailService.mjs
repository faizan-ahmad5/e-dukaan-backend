import nodemailer from "nodemailer";
import crypto from "crypto";
import emailConfig from "../config/emailConfig.mjs";

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: emailConfig.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(emailConfig.EMAIL_PORT) || 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: emailConfig.EMAIL_USER,
        pass: emailConfig.EMAIL_PASS,
      },
    });
  }

  // Generate verification token
  generateVerificationToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  // Generate password reset token
  generateResetToken() {
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    return { token, hashedToken };
  }

  // Send password reset email
  async sendPasswordResetEmail(user, token) {
    try {
      const resetUrl = `${
        process.env.FRONTEND_URL || "http://localhost:3000"
      }/reset-password?token=${token}`;

      const mailOptions = {
        from: {
          name: "E-Dukaan",
          address: emailConfig.EMAIL_FROM || emailConfig.EMAIL_USER,
        },
        to: user.email,
        subject: "🔐 E-Dukaan - Password Reset Request",
        html: this.getPasswordResetEmailTemplate(user.name, resetUrl),
        text: `
          Hi ${user.name},
          
          You requested to reset your password for your E-Dukaan account.
          
          Click the link below to reset your password:
          ${resetUrl}
          
          This link will expire in 10 minutes.
          
          If you didn't request this password reset, please ignore this email.
          
          Best regards,
          E-Dukaan Team
        `,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(
        `Password reset email sent to ${user.email}:`,
        result.messageId
      );

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Email template for password reset
  getPasswordResetEmailTemplate(userName, resetUrl) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your E-Dukaan Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-align: center; padding: 30px 20px; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 20px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🔐 Password Reset</h1>
          <p>Reset your E-Dukaan account password</p>
        </div>
        <div class="content">
          <h2>Hi ${userName}!</h2>
          <p>You requested to reset your password for your E-Dukaan account.</p>
          <p>Click the button below to set a new password:</p>
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #007bff;">${resetUrl}</p>
          
          <div class="warning">
            <strong>⚠️ Important:</strong>
            <ul>
              <li>This reset link will expire in <strong>10 minutes</strong></li>
              <li>For security, only use this link once</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <p>If you're having trouble clicking the button, copy and paste the URL above into your web browser.</p>
        </div>
        <div class="footer">
          <p>© 2024 E-Dukaan. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  async testConnection() {
    try {
      await this.transporter.verify();
      console.log("✅ Email service is ready to send emails");
      return { success: true };
    } catch (error) {
      console.error("❌ Email service configuration error:", error);
      return { success: false, error: error.message };
    }
  }
}

export default new EmailService();
