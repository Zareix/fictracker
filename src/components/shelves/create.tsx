import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { z } from "zod/v4-mini";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
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
import { api } from "~/utils/api";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string(),
  icon: z.string(),
});

const CreateShelveDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const apiUtils = api.useUtils();
  const createShelfMutation = api.shelve.create.useMutation({
    onSuccess: () => {
      toast.success("Shelf created!");
      setIsOpen(false);
      apiUtils.shelve.getAll.invalidate().catch(console.error);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      name: "",
      icon: "album",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createShelfMutation.mutate(values);
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button>Create shelf</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create a new shelf</DrawerTitle>
        </DrawerHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </Form>
      </DrawerContent>
    </Drawer>
  );
};

export default CreateShelveDialog;
