import nodemailer from "nodemailer";
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
