import { useForm } from "react-hook-form";
import { z } from "zod";
import { DialogFooter } from "~/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { api, type RouterInputs, type RouterOutputs } from "~/utils/api";
import { toast } from "sonner";
import { preprocessStringToNumber } from "~/lib/utils";
import { Checkbox } from "~/components/ui/checkbox";

const createTempSub = (fanfic: RouterInputs["fanfic"]["create"]) =>
  ({
    ...fanfic,
    id: -1,
    createdAt: new Date(),
    updatedAt: new Date(),
  }) satisfies RouterOutputs["fanfic"]["getAll"][number];

const fanficCreateSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  author: z.string(),
  website: z.string(),
  summary: z.string(),
  likesCount: z.preprocess(preprocessStringToNumber, z.number()),
  tags: z.string(),
  writingCompleted: z.boolean(),
  fandom: z.string(),
  ships: z.string(),
  language: z.string(),
});

export const EditCreateForm = ({
  fanfic,
  onFinished,
}: {
  fanfic?: RouterOutputs["fanfic"]["getAll"][number];
  onFinished?: () => void;
}) => {
  const apiUtils = api.useUtils();
  const createFanficMutation = api.fanfic.create.useMutation({
    onSuccess: () => {
      toast.success("Fanfic created!");
      onFinished?.();
      setTimeout(() => {
        form.reset();
      }, 300);
    },
    onMutate: async (newFanfic) => {
      await apiUtils.fanfic.getAll.cancel();

      const previousSubs = apiUtils.fanfic.getAll.getData();

      apiUtils.fanfic.getAll.setData(undefined, (old) =>
        !old
          ? []
          : [...old, createTempSub(newFanfic)].sort((a, b) =>
              a.title.localeCompare(b.title),
            ),
      );

      return { previousSubs };
    },
    onError: (err, _, context) => {
      toast.error(err.message);
      apiUtils.fanfic.getAll.setData(undefined, context?.previousSubs);
    },
    onSettled: () => {
      apiUtils.fanfic.getAll.invalidate().catch(console.error);
    },
  });
  const editFanficMutation = api.fanfic.edit.useMutation({
    onSuccess: () => {
      toast.success("Fanfic updated!");
      onFinished?.();
      setTimeout(() => {
        form.reset();
      }, 300);
    },
    onMutate: async (newFanfic) => {
      await apiUtils.fanfic.getAll.cancel();

      const previousSubs = apiUtils.fanfic.getAll.getData();

      apiUtils.fanfic.getAll.setData(undefined, (old) => {
        if (!old) {
          return [];
        }
        const index = old.findIndex((s) => s.id === newFanfic.id);
        const oldSub = old[index];
        if (index === -1 || !oldSub) {
          return old;
        }
        return [
          ...old.slice(0, index),
          {
            ...oldSub,
            title: newFanfic.title,
            url: newFanfic.url,
            author: newFanfic.author,
            website: newFanfic.website,
            summary: newFanfic.summary,
            likesCount: newFanfic.likesCount,
            tags: newFanfic.tags,
            writingCompleted: newFanfic.writingCompleted,
            fandom: newFanfic.fandom,
            ships: newFanfic.ships,
            language: newFanfic.language,
          },
          ...old.slice(index + 1),
        ];
      });

      return { previousSubs };
    },
    onError: (err, _, context) => {
      toast.error(err.message);
      apiUtils.fanfic.getAll.setData(undefined, context?.previousSubs);
    },
    onSettled: () => {
      apiUtils.fanfic.getAll.invalidate().catch(console.error);
    },
  });
  const shelvesQuery = api.shelve.getAll.useQuery();

  const form = useForm<z.infer<typeof fanficCreateSchema>>({
    resolver: zodResolver(fanficCreateSchema),
    defaultValues: {
      title: fanfic?.title ?? "",
      url: fanfic?.url ?? "",
      author: fanfic?.author ?? "",
      website: fanfic?.website ?? "",
      summary: fanfic?.summary ?? "",
      likesCount: fanfic?.likesCount ?? 0,
      tags: fanfic?.tags ?? "",
      writingCompleted: fanfic?.writingCompleted ?? false,
      fandom: fanfic?.fandom ?? "",
      ships: fanfic?.ships ?? "",
      language: fanfic?.language ?? "",
    },
  });

  function onSubmit(values: z.infer<typeof fanficCreateSchema>) {
    if (fanfic) {
      editFanficMutation.mutate({
        ...values,
        id: fanfic.id,
      });
    } else {
      createFanficMutation.mutate(values);
    }
  }

  return (
    <>
      {shelvesQuery.isLoading ? (
        <div>Loading...</div>
      ) : shelvesQuery.isError ? (
        <div>Error: {shelvesQuery.error?.message}</div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Netflix" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author</FormLabel>
                  <FormControl>
                    <Input placeholder="placeholder" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="placeholder" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Input placeholder="placeholder" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="likesCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Likes Count</FormLabel>
                  <FormControl>
                    <Input placeholder="placeholder" type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="placeholder" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="writingCompleted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Completed</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fandom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fandom</FormLabel>
                  <FormControl>
                    <Input placeholder="placeholder" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ships"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ships</FormLabel>
                  <FormControl>
                    <Input placeholder="placeholder" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Language</FormLabel>
                  <FormControl>
                    <Input placeholder="placeholder" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                isLoading={
                  createFanficMutation.isPending || editFanficMutation.isPending
                }
              >
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      )}
    </>
  );
};
