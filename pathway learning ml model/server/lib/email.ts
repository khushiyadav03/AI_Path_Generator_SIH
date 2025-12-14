let transporter: any = null;
let nodemailer: any = null;

async function loadNodemailer() {
  if (!nodemailer) {
    nodemailer = await import("nodemailer");
  }
  return nodemailer;
}

export async function initEmailTransporter() {
  try {
    const nm = await loadNodemailer();
    // Configure email transporter using Gmail SMTP
    // For production, use environment variables for credentials
    transporter = nm.default.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "", // Gmail address
        pass: process.env.EMAIL_APP_PASSWORD || "", // Gmail App Password (not regular password)
      },
    });
  } catch (error) {
    console.warn("Failed to initialize email transporter:", error);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  resetUrl: string
): Promise<void> {
  if (!transporter) {
    await initEmailTransporter();
  }

  if (!transporter || !process.env.EMAIL_USER) {
    console.warn("Email not configured. Reset URL:", resetUrl);
    console.warn("Set EMAIL_USER and EMAIL_APP_PASSWORD in .env file");
    return;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Request - Personalized Learning Path Generator",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #6366f1;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested to reset your password for your account. Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(to right, #8b5cf6, #06b6d4); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          This link will expire in 1 hour. If you didn't request this, please ignore this email.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send password reset email");
  }
}

