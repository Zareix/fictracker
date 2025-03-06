import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerNestedRoot,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { api } from "~/utils/api";
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
import { EditCreateForm } from "~/components/fanfics/edit-create-form";

const fanficExtractSchema = z.object({
  url: z.string().url(),
});

export const CreateFanficDialog = ({
  trigger,
}: {
  trigger?: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const extractFanficDataMutation = api.fanfic.extractData.useMutation({
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const form = useForm<z.infer<typeof fanficExtractSchema>>({
    resolver: zodResolver(fanficExtractSchema),
  });

  function onSubmit(values: z.infer<typeof fanficExtractSchema>) {
    extractFanficDataMutation.mutate(values.url);
  }

  const reset = () => {
    form.reset();
    extractFanficDataMutation.reset();
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(o) => {
        setIsOpen(o);
        if (!o) reset();
      }}
      repositionInputs={false}
    >
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add Fanfic</DrawerTitle>
        </DrawerHeader>
        {!extractFanficDataMutation.data ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Link to the fanfic" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DrawerFooter>
                <Button
                  type="submit"
                  isLoading={extractFanficDataMutation.isPending}
                >
                  Submit
                </Button>
              </DrawerFooter>
            </form>
          </Form>
        ) : (
          <EditCreateForm
            fanfic={extractFanficDataMutation.data}
            onFinished={() => {
              setIsOpen(false);
              reset();
            }}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
};
