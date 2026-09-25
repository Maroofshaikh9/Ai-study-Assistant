import nodemailer from "nodemailer";

interface SendOtpParams {
  to: string;
  otp: string;
}

export async function sendOtpEmail({ to, otp }: SendOtpParams) {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || "StudyMate <studymate.supportteam@gmail.com>";

  if (!user || !pass) {
    throw new Error("Email provider configuration is missing.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const mailOptions = {
    from,
    to,
    subject: "StudyMate Email Verification",
    text: `Hello,\n\nYour StudyMate verification code is:\n\n${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this code, you can ignore this email.\n\nRegards,\nStudyMate Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
        <h2 style="color: #333;">StudyMate Email Verification</h2>
        <p>Hello,</p>
        <p>Your StudyMate verification code is:</p>
        <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 4px;">${otp}</h1>
        <p style="color: #777;">This code expires in 10 minutes.</p>
        <p style="color: #777;">If you did not request this code, you can ignore this email.</p>
        <br />
        <p style="color: #777;">Regards,<br />StudyMate Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch {
    // DO NOT expose the raw SMTP error to the browser
    console.error("Error sending email: SMTP delivery failed");
    throw new Error("Unable to send verification email. Please try again.");
  }
}
