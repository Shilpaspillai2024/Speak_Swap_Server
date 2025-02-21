import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface BookingDetails{

  tutorName:string;
  sessionDate:string;
  sessionTime:string;
  refundAmount?:number;
}

class EmailUtils {
  public static transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  static async sendOtp(
    email: string,
    otp: string
  ): Promise<{ email: string; otp: string; message: string }> {
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SpeakSwap OTP</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 5px; border: 1px solid #ffd700;">
          <tr>
            <td style="padding: 20px; background-color: #2c3e50; text-align: center;">
              <h1 style="color: #ffffff; margin: 0;">SpeakSwap</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px;">
              <h2 style="color: #333; margin-bottom: 20px;">Account Verification OTP</h2>
              <p style="margin-bottom: 15px;">Hello,</p>
              <p style="margin-bottom: 15px;">Thank you for signing up for SpeakSwap. To complete your registration, please use the OTP below:</p>
              <div style="background-color: #ffd700; border-radius: 5px; padding: 15px; text-align: center; margin-bottom: 20px;">
                <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #333;">${otp}</span>
              </div>
              <p style="margin-bottom: 15px;">This OTP will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
              <p style="margin-bottom: 20px;">Thanks for choosing SpeakSwap!</p>
              <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply to this email.</p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; color: #333; text-align: center; padding: 10px; font-size: 12px;">
              © 2024 SpeakSwap. All rights reserved.
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"SpeakSwap"<${process.env.GMAIL_USER}>`,
      to: email,
      subject: "your otp from speak swap signup",
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { email, otp, message: "OTP sent Successfully" };
    } catch (error) {
      throw new Error("Failed to send otp email");
    }
  }



  static async sendSessionCancellationNotification(
    userEmail:string,
    userName:string,
    bookingDetails:BookingDetails
  ):Promise<{success:boolean,message:string}>{
    const {tutorName,sessionDate,sessionTime,refundAmount}=bookingDetails;

    const refundMessage =refundAmount
    ? `<p style="margin-bottom: 15px;">A refund of $${refundAmount.toFixed(2)} has been processed and will be credited to your wallet.</p>`
    : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>SpeakSwap Session Cancellation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 5px; border: 1px solid #e0e0e0;">
        <tr>
          <td style="padding: 20px; background-color: #2c3e50; text-align: center;">
            <h1 style="color: #ffffff; margin: 0;">SpeakSwap</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px;">
            <h2 style="color: #e74c3c; margin-bottom: 20px;">Session Cancellation Notice</h2>
            <p style="margin-bottom: 15px;">Hello ${userName},</p>
            <p style="margin-bottom: 15px;">We regret to inform you that your upcoming session has been cancelled by the tutor.</p>
            
            <div style="background-color: #f9f9f9; border-left: 4px solid #e74c3c; padding: 15px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; margin-bottom: 10px; color: #333;">Session Details:</h3>
              <p style="margin: 5px 0;"><strong>Tutor:</strong> ${tutorName}</p>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${sessionDate}</p>
              <p style="margin: 5px 0;"><strong>Time:</strong> ${sessionTime}</p>
            </div>
            
            ${refundMessage}
            
            <p style="margin-bottom: 15px;">We apologize for any inconvenience this may cause. You can book another session with a different tutor from our platform.</p>
            
            
            <p style="margin-bottom: 20px;">If you have any questions or concerns, please contact our support team.</p>
            <p style="margin-bottom: 15px;">Best regards,<br>The SpeakSwap Team</p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f5f5f5; color: #666; text-align: center; padding: 15px; font-size: 12px;">
            © 2024 SpeakSwap. All rights reserved.<br>
            If you have any questions, please contact <a href="mailto:support@speakswap.com" style="color: #3498db;">support@speakswap.com</a>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;


  const mailOptions={
    from: `"SpeakSwap" <${process.env.GMAIL_USER}>`,
    to: userEmail,
    subject: "Your SpeakSwap Session Has Been Cancelled",
    html: htmlContent,
  };
  try {
    await this.transporter.sendMail(mailOptions);
    return {success:true,message:"Cancellation Notification sent succeessfully"};

    
  } catch (error) {
    console.error("Email sending error:", error);
      return { success: false, message: "Failed to send cancellation notification" };
  }

  }
}

export default EmailUtils;
