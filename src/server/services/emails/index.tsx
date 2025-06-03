import { createTransport } from "nodemailer";
import { env } from "~/env";
import OTPEmail from "~/server/services/emails/otp-email";
import ChangeEmailAddressEmail from "~/server/services/emails/change-email";
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

  console.log(`Sending OTP email to ${to}`);
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: "Your Verification Code For Fictracker",
    html: await render(<OTPEmail otpCode={otpCode} />),
  });
};

export const sendChangeEmailVerification = async ({
  to,
  url,
}: {
  to: string;
  url: string;
}) => {
  if (!env.EMAIL_SERVER_URL) {
    throw new Error("Email server URL is not configured.");
  }
  const transporter = createTransport(env.EMAIL_SERVER_URL);

  console.log(`Sending 'change email address' email to ${to}`);
  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: "Confirm Your Email Change on Fictracker",
    html: await render(<ChangeEmailAddressEmail url={url} />),
  });
};
