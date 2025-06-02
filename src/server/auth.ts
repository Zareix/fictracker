import { db } from "~/server/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { account, session, users, verification } from "~/server/db/schema";
import { env } from "~/env";
import type { NextRequest } from "next/server";
import { emailOTP } from "better-auth/plugins/email-otp";
import { TRPCError } from "@trpc/server";
import { sendOTPEmail } from "~/server/services/emails";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user: users,
      session,
      account,
      verification,
    },
  }),
  advanced: {
    database: { generateId: false },
  },
  trustedOrigins: [env.BETTER_AUTH_URL],
  socialProviders: {
    google:
      env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
        ? {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          }
        : undefined,
  },
  plugins: [
    emailOTP({
      async sendVerificationOTP({ email, otp }) {
        await sendOTPEmail({
          to: email,
          otpCode: otp,
        });
      },
    }),
  ],
});

export type Session = typeof auth.$Infer.Session;

export const isAuthenticated = async (req: NextRequest) =>
  !!(
    await auth.api.getSession({
      headers: req.headers,
    })
  )?.user;

export const getUserFromSession = (session: Session) => {
  const user = session?.user;
  if (!user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  return user;
};
