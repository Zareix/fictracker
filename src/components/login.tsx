import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { BookUserIcon } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4-mini";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "~/components/ui/input-otp";
import { authClient } from "~/lib/auth-client";

const loginSchema = z.object({
  email: z.email(),
  otp: z.string(),
});

export const LoginForm = () => {
  const sendOTPMutation = useMutation({
    mutationFn: async (values: z.infer<typeof loginSchema>) => {
      return authClient.emailOtp.sendVerificationOtp({
        email: values.email,
        type: "sign-in",
      });
    },
    onError: () => {
      toast.error("Could not login, please try again.");
    },
  });
  const signInMutation = useMutation({
    mutationFn: async (values: z.infer<typeof loginSchema>) => {
      return authClient.signIn.emailOtp(values);
    },
    onError: () => {
      toast.error("Could not login, please try again.");
    },
  });
  const signInGoogleMutation = useMutation({
    mutationFn: async () => {
      return authClient.signIn.social({
        provider: "google",
      });
    },
    onError: () => {
      toast.error("Could not login, please try again.");
    },
  });
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: standardSchemaResolver(loginSchema),
    defaultValues: {
      email: "",
      otp: "",
    },
  });

  const wasOTPSent = !!sendOTPMutation.submittedAt;

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    if (!wasOTPSent) {
      sendOTPMutation.mutate(values);
      toast.success("One-time password sent to your email.");
      return;
    }
    signInMutation.mutate(values);
  };

  const loginGoogle = () => {
    signInGoogleMutation.mutate();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <Link
          href="#"
          className="flex items-center gap-2 self-center py-4 text-xl font-medium"
        >
          <BookUserIcon size={24} />
          Fictracker
        </Link>
        <CardTitle className="text-2xl">Login</CardTitle>
      </CardHeader>
      <CardContent className="mt-4 pb-4">
        <Button variant="outline" className="w-full" onClick={loginGoogle}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className="mr-2 h-4 w-4"
          >
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          Login with Google
        </Button>
        <div
          className="after:border-border relative my-6 text-center text-sm after:absolute
            after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center
            after:border-t"
        >
          <span className="bg-card text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grid gap-2">
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example@example.com"
                        autoComplete="email webauthn"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {wasOTPSent && (
                <FormField
                  control={form.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>One-Time Password</FormLabel>
                      <FormControl>
                        <InputOTP
                          maxLength={6}
                          pattern={REGEXP_ONLY_DIGITS}
                          {...field}
                        >
                          <InputOTPGroup className="mx-auto my-1">
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </FormControl>
                      <FormDescription>
                        Please enter the one-time password sent to you by email.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
