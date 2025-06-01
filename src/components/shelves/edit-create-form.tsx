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
import { api, type RouterOutputs } from "~/utils/api";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string(),
  icon: z.string(),
});

export const EditCreateShelfDialog = ({
  setIsOpen,
  shelf,
}: {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  shelf?: Pick<RouterOutputs["shelve"]["get"], "id" | "name" | "icon">;
}) => {
  const apiUtils = api.useUtils();
  const createShelfMutation = api.shelve.create.useMutation({
    onSuccess: () => {
      toast.success("Shelf created!");
      setIsOpen(false);
      apiUtils.shelve.getAllWithContent.invalidate().catch(console.error);
      apiUtils.shelve.getAll.invalidate().catch(console.error);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const editShelfMutation = api.shelve.edit.useMutation({
    onSuccess: () => {
      toast.success("Shelf edited!");
      setIsOpen(false);
      apiUtils.shelve.getAll.invalidate().catch(console.error);
      apiUtils.shelve.getAllWithContent.invalidate().catch(console.error);
      apiUtils.shelve.get.invalidate().catch(console.error);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: standardSchemaResolver(formSchema),
    defaultValues: {
      name: shelf?.name ?? "",
      icon: shelf?.icon ?? "album",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (shelf) {
      editShelfMutation.mutate({
        ...values,
        id: shelf.id,
      });
    } else {
      createShelfMutation.mutate(values);
    }
  }

  return (
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
  );
};
