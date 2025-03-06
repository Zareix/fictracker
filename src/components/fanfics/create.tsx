import { DialogFooter, DialogTitle } from "~/components/ui/dialog";
import { useState } from "react";
import { EditCreateForm } from "~/components/fanfics/edit-create-form";
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";
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
    onSuccess: (data) => {
      console.log(data);
    },
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

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} repositionInputs={false}>
      <DrawerTrigger asChild>{trigger}</DrawerTrigger>
      <DrawerContent>
        <DialogTitle>Add Fanfic</DialogTitle>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="Netflix" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                isLoading={extractFanficDataMutation.isPending}
              >
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );

  // return (
  //   <Drawer open={isOpen} onOpenChange={setIsOpen} repositionInputs={false}>
  //     <DrawerTrigger asChild>{trigger}</DrawerTrigger>
  //     <DrawerContent>
  //       <DialogTitle>Create Fanfic</DialogTitle>
  //       <EditCreateForm onFinished={() => setIsOpen(false)} />
  //     </DrawerContent>
  //   </Drawer>
  // );
};
