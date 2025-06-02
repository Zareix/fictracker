import { createTransport } from "nodemailer";
import { env } from "~/env";
import OTPEmail from "~/server/services/emails/otp-email";
import { render } from "@react-email/components";

export const sendOTPEmail = async ({
  to,
  otpCode,
}: {
  to: string;
  otpCode: string;
}) => {
  if (!env.EMAIL_SERVER_URL) {
    throw new Error("Email server URL is not configured.");
  }
  const transporter = createTransport(env.EMAIL_SERVER_URL);

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: "Your Verification Code For Fictracker",
    html: await render(<OTPEmail otpCode={otpCode} />),
  });
};
