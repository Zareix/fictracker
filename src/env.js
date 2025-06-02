import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod/v4-mini";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    BETTER_AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.optional(z.string()),
    BETTER_AUTH_URL: z.url(),
    DATABASE_PATH: z.string(),
    NODE_ENV: z._default(
      z.enum(["development", "test", "production"]),
      "development",
    ),
    GOOGLE_CLIENT_ID: z.optional(z.string()),
    GOOGLE_CLIENT_SECRET: z.optional(z.string()),
    EMAIL_SERVER_URL: z.optional(z.string()),
    EMAIL_FROM: z.optional(z.string()),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_ENV: z._default(
      z.enum(["development", "test", "production"]),
      "development",
    ),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    DATABASE_PATH: process.env.DATABASE_PATH,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    EMAIL_SERVER_URL: process.env.EMAIL_SERVER_URL,
    EMAIL_FROM: process.env.EMAIL_FROM,
    // NEXT_PUBLIC_AUTH_URL: process.env.NEXT_PUBLIC_AUTH_URL,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
