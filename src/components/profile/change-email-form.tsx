import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v4-mini";
import { authClient } from "~/lib/auth-client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

const updateEmailSchema = z.object({
  email: z.email("Invalid email address"),
});
type UpdateEmailValues = z.infer<typeof updateEmailSchema>;

type Props = {
  currentEmail: string;
};

export const ChangeEmailForm = (
  { currentEmail }: Props = { currentEmail: "" },
) => {
  const changeEmailMutation = useMutation({
    mutationKey: ["changeEmail"],
    mutationFn: async (data: UpdateEmailValues) => {
      return authClient.changeEmail({
        newEmail: data.email,
      });
    },
    onSuccess: (data) => {
      if ("error" in data && data.error) {
        toast.error("Error changing email", {
          description: data.error.message,
        });
        return;
      }
      toast.success(
        "Check your email for a verification link to confirm the change.",
      );
    },
    onError: () => {
      toast.error("Error changing email");
    },
  });

  const changeEmailForm = useForm<UpdateEmailValues>({
    resolver: standardSchemaResolver(updateEmailSchema),
    defaultValues: {
      email: currentEmail,
    },
  });

  const handleChangeEmail = (data: UpdateEmailValues) => {
    changeEmailMutation.mutate(data);
  };

  return (
    <Form {...changeEmailForm}>
      <form
        onSubmit={changeEmailForm.handleSubmit(handleChangeEmail)}
        className="flex flex-col gap-3"
      >
        <h2 className="text-2xl">Change email</h2>
        <FormField
          control={changeEmailForm.control}
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
        <Button type="submit" isLoading={changeEmailMutation.isPending}>
          Change Email
        </Button>
      </form>
    </Form>
  );
};
