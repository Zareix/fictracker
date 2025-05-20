import { useForm } from "react-hook-form";
import { z } from "zod/v4-mini";
import { DialogFooter } from "~/components/ui/dialog";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
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
import { cn } from "~/lib/utils";
import { Textarea } from "~/components/ui/textarea";
import { Switch } from "~/components/ui/switch";
import { RefreshCwIcon } from "lucide-react";
import { Ratings } from "~/lib/constant";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const createTempSub = (fanfic: RouterInputs["fanfic"]["create"]) =>
  ({
    ...fanfic,
    id: -1,
    progress: 0,
    chaptersCount: fanfic.chapters.length,
    lastChapterUrl: "#",
    shelves: [],
    grade: null,
    rating: null,
  }) satisfies RouterOutputs["fanfic"]["getAll"][number];

const fanficCreateSchema = z.object({
  title: z.string(),
  url: z.url(),
  author: z.string(),
  website: z.string(),
  summary: z.string(),
  likesCount: z.transform((val) => Number(val)),
  tags: z.array(z.string()),
  rating: z.optional(z.enum(Ratings)),
  isCompleted: z.boolean(),
  fandom: z.array(z.string()),
  ships: z.array(z.string()),
  language: z.string(),
  chapters: z.array(
    z.object({
      number: z.number(),
      wordsCount: z.number(),
      url: z.string(),
      title: z.string(),
    }),
  ),
});

export const EditCreateForm = ({
  fanfic,
  onFinished,
}: {
  fanfic?: z.infer<typeof fanficCreateSchema> & {
    id?: number;
  };
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
            isCompleted: newFanfic.isCompleted,
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
  const extractFanficChaptersMutation = api.fanfic.extractChapters.useMutation({
    onSuccess: (chapters) => {
      if (chapters.length === 0) return;
      form.setValue("chapters", chapters);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const shelvesQuery = api.shelve.getAll.useQuery();

  const form = useForm<z.infer<typeof fanficCreateSchema>>({
    resolver: standardSchemaResolver(fanficCreateSchema),
    defaultValues: {
      title: fanfic?.title ?? "",
      url: fanfic?.url ?? "",
      author: fanfic?.author ?? "",
      website: fanfic?.website ?? "",
      summary: fanfic?.summary ?? "",
      likesCount: fanfic?.likesCount ?? 0,
      tags: fanfic?.tags ?? [],
      isCompleted: fanfic?.isCompleted ?? false,
      fandom: fanfic?.fandom ?? [],
      ships: fanfic?.ships ?? [],
      rating: fanfic?.rating ?? undefined,
      language: fanfic?.language ?? "",
      chapters: fanfic?.chapters ?? [],
    },
  });

  function onSubmit(values: z.infer<typeof fanficCreateSchema>) {
    if (fanfic?.id) {
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
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Ratings.map((r) => (
                          <SelectItem value={r} key={r}>
                            {r}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <Textarea placeholder="placeholder" rows={5} {...field} />
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
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  fanfic?.url
                    ? extractFanficChaptersMutation.mutate(fanfic?.url)
                    : null
                }
                disabled={!fanfic?.url}
                variant="ghost"
                className="h-full"
                type="button"
              >
                <RefreshCwIcon
                  className={cn(
                    extractFanficChaptersMutation.isPending && "animate-spin",
                  )}
                />
              </Button>
              <FormItem className="flex w-1/3 flex-col">
                <FormLabel>Total chapters</FormLabel>
                <FormControl>
                  <Input
                    value={fanfic?.chapters.length}
                    type="number"
                    disabled
                  />
                </FormControl>
              </FormItem>
              <FormField
                control={form.control}
                name="isCompleted"
                render={({ field }) => (
                  <FormItem className="flex w-1/3 flex-col">
                    <FormLabel>Completed</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="my-0 mt-3"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
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
