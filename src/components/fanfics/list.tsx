import React, { useMemo } from "react";
import { api, type RouterOutputs } from "~/utils/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  BookIcon,
  BookMarkedIcon,
  BookOpenCheckIcon,
  BookOpenIcon,
  CheckIcon,
  EditIcon,
  ExternalLinkIcon,
  MinusIcon,
  MoreVerticalIcon,
  PlusIcon,
  StarIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { EditFanficDialog } from "~/components/fanfics/edit";
import { DeleteDialog } from "~/components/fanfics/delete";
import { toast } from "sonner";
import Link from "next/link";
import type { Shelve } from "~/server/db/schema";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import { useFilters } from "~/lib/hooks/use-filters";

type FanficItem = RouterOutputs["fanfic"]["getAll"][number];

type Props = {
  fanfics: Array<FanficItem>;
};

export const FanficList = ({ fanfics }: Props) => {
  const [filters] = useFilters();
  const shelvesQuery = api.shelve.getAllWithContent.useQuery();

  const filteredFanfics = useMemo(() => {
    let res = fanfics;
    if (filters.fandom) {
      res = res.filter((f) => f.fandom.includes(filters.fandom ?? ""));
    }
    if (filters.rating) {
      res = res.filter((f) => f.rating === filters.rating);
    }
    if (filters.ships && filters.ships.length > 0) {
      res = res.filter((f) =>
        f.ships.some((ship) => filters.ships?.includes(ship)),
      );
    }
    if (filters.tags && filters.tags.length > 0) {
      res = res.filter((f) =>
        f.tags.some((tag) => filters.tags?.includes(tag)),
      );
    }
    if (filters.language) {
      res = res.filter((f) => f.language === filters.language);
    }
    return res;
  }, [
    fanfics,
    filters.fandom,
    filters.rating,
    filters.ships,
    filters.tags,
    filters.language,
  ]);

  if (filteredFanfics.length === 0) {
    return (
      <div className="text-muted-foreground text-center">No fanfics found</div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {filteredFanfics.map((fanfic) => (
        <FanficListItem
          key={fanfic.id}
          fanfic={fanfic}
          shelves={shelvesQuery.data ?? []}
        />
      ))}
    </div>
  );
};

const FanficListItem = ({
  fanfic,
  shelves,
}: {
  fanfic: FanficItem;
  shelves: Array<Pick<Shelve, "id" | "name">>;
}) => {
  const [isOpen, setIsOpen] = useState({
    delete: false,
    edit: false,
  });
  const apiUtils = api.useUtils();
  const markAsReadMutation = api.progress.markAsRead.useMutation({
    onSuccess: () => {
      apiUtils.fanfic.getAll.invalidate().catch(console.error);
      apiUtils.shelve.get.invalidate().catch(console.error);
      toast.success("Fanfic marked as read!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const incrementChapterMutation = api.progress.increment.useMutation({
    onSuccess: () => {
      apiUtils.fanfic.getAll.invalidate().catch(console.error);
      apiUtils.shelve.get.invalidate().catch(console.error);
      toast.success("Chapter incremented!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const decrementChapterMutation = api.progress.decrement.useMutation({
    onSuccess: () => {
      apiUtils.fanfic.getAll.invalidate().catch(console.error);
      apiUtils.shelve.get.invalidate().catch(console.error);
      toast.success("Chapter decremented!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const toggleFanficInShelfMutation = api.shelve.toggleFanfic.useMutation({
    onSuccess: (data) => {
      apiUtils.fanfic.getAll.invalidate().catch(console.error);
      apiUtils.shelve.get.invalidate().catch(console.error);
      apiUtils.shelve.getAllWithContent.invalidate().catch(console.error);
      if (data === "added") {
        toast.success("Fanfic added to shelf!");
      } else {
        toast.success("Fanfic removed from shelf!");
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });
  const updateFanficGradeMutation = api.fanfic.updateGrade.useMutation({
    onSuccess: () => {
      apiUtils.fanfic.getAll.invalidate().catch(console.error);
      apiUtils.shelve.get.invalidate().catch(console.error);
      apiUtils.shelve.getAllWithContent.invalidate().catch(console.error);
      toast.success("Fanfic grade updated!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const addToShelf = (shelfId: number) => {
    toggleFanficInShelfMutation.mutate({ fanficId: fanfic.id, shelfId });
  };

  const setGrade = (grade: number) => {
    updateFanficGradeMutation.mutate({ ...fanfic, grade });
  };

  if (fanfic.id === -1) {
    return (
      <Card className="mt-3 opacity-50">
        <CardContent>
          <h2 className="text-center text-xl font-semibold">{fanfic.title}</h2>
          <div className="text-foreground/80 flex flex-wrap gap-x-4 gap-y-2 pt-1 text-base md:gap-x-6">
            <div className="flex gap-2">
              <BookOpenCheckIcon />
              <span>TBR</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const firstFandom = fanfic.fandom[0];
  const firstShip = fanfic.ships[0];

  return (
    <>
      <DropdownMenu modal={false}>
        <Card>
          <CardContent>
            <div className="flex items-center gap-1">
              <h2 className="text-xl font-semibold md:text-center">
                {fanfic.title}
              </h2>
              <div className="ml-auto flex items-center gap-1">
                <Rating rating={fanfic.rating} />
                <DropdownMenuTrigger>
                  <MoreVerticalIcon size={18} />
                </DropdownMenuTrigger>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1 pt-1">
              {firstFandom && <Badge variant="default">{firstFandom}</Badge>}
              {firstShip && <Badge variant="secondary">{firstShip}</Badge>}
            </div>
          </CardContent>
          <CardFooter className="text-foreground/80 flex items-center gap-x-4 gap-y-2 pt-2 text-sm md:gap-x-6">
            <div className="flex items-center gap-2">
              <ProgressToStatus
                isCompleted={fanfic.isCompleted}
                progress={fanfic.progress}
                chaptersCount={fanfic.chaptersCount}
              />
            </div>
            {fanfic.grade && (
              <div className="flex gap-2">
                {Array(fanfic.grade)
                  .fill(null)
                  .map((_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: no worry here
                    <StarIcon key={i} size={16} className="fill-yellow-300" />
                  ))}
              </div>
            )}
            <div className="ml-auto">
              {fanfic.progress}/{fanfic.chaptersCount}
            </div>
          </CardFooter>
        </Card>
        <DropdownMenuContent className="mx-2">
          {fanfic.progress < fanfic.chaptersCount && (
            <Link href={fanfic.lastChapterUrl ?? fanfic.url} target="_blank">
              <DropdownMenuItem>
                <ExternalLinkIcon />
                <span>Continue reading</span>
              </DropdownMenuItem>
            </Link>
          )}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <BookOpenCheckIcon />
              {fanfic.progress === fanfic.chaptersCount ? (
                <span>Read</span>
              ) : (
                <span>
                  Reading {fanfic.progress + 1}/{fanfic.chaptersCount}
                </span>
              )}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {fanfic.progress < fanfic.chaptersCount && (
                  <>
                    <DropdownMenuItem
                      onClick={() => markAsReadMutation.mutate(fanfic.id)}
                    >
                      <BookOpenCheckIcon />
                      <span>Mark as read</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => incrementChapterMutation.mutate(fanfic.id)}
                    >
                      <PlusIcon />
                      <span>Increment chapter</span>
                    </DropdownMenuItem>
                  </>
                )}
                {fanfic.progress > 0 && (
                  <DropdownMenuItem
                    onClick={() => decrementChapterMutation.mutate(fanfic.id)}
                  >
                    <MinusIcon />
                    <span>Decrement chapter</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem
            onClick={() => setIsOpen({ ...isOpen, edit: true })}
          >
            <EditIcon />
            <span>Edit</span>
          </DropdownMenuItem>
          {shelves.length > 0 && (
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <BookMarkedIcon />
                <span>
                  {fanfic.shelves.length === 0
                    ? "Add to shelves"
                    : fanfic.shelves.length === 1
                      ? `In a shelf`
                      : `In ${fanfic.shelves.length} shelves`}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {shelves
                    .filter((shelf) => shelf.id > 0)
                    .map((shelf) => (
                      <DropdownMenuItem
                        key={shelf.id}
                        onClick={() => addToShelf(shelf.id)}
                      >
                        {fanfic.shelves.includes(shelf.id) && (
                          <CheckIcon className="h-4 w-4" />
                        )}
                        <span>{shelf.name}</span>
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          )}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <StarIcon />
              <span>{fanfic.grade ? `${fanfic.grade}/5` : "Set grade"}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {[1, 2, 3, 4, 5].map((grade) => (
                  <DropdownMenuItem key={grade} onClick={() => setGrade(grade)}>
                    {Array(grade)
                      .fill(null)
                      .map((_, i) => (
                        <StarIcon
                          // biome-ignore lint/suspicious/noArrayIndexKey: no worry here
                          key={i}
                          className={cn(
                            grade === fanfic.grade && "fill-yellow-300",
                          )}
                        />
                      ))}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
          <DropdownMenuItem
            variant="destructive"
            onClick={() =>
              setIsOpen({
                ...isOpen,
                delete: true,
              })
            }
          >
            <TrashIcon />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteDialog
        fanfic={fanfic}
        isOpen={isOpen.delete}
        setIsOpen={() => setIsOpen({ ...isOpen, delete: false })}
      />
      <EditFanficDialog
        fanfic={fanfic}
        isOpen={isOpen.edit}
        setIsOpen={() => setIsOpen({ ...isOpen, edit: false })}
      />
    </>
  );
};

const ProgressToStatus = ({
  isCompleted,
  progress,
  chaptersCount,
}: {
  isCompleted: boolean;
  progress: number;
  chaptersCount: number;
}) => {
  if (isCompleted && progress === chaptersCount) {
    return (
      <>
        <BookOpenCheckIcon />
        <span>Read</span>
      </>
    );
  }
  if (!isCompleted && progress === chaptersCount) {
    return (
      <>
        <BookIcon />
        <span>Waiting Next Chapters</span>
      </>
    );
  }
  if (progress === 0) {
    return (
      <>
        <BookIcon />
        <span>TBR</span>
      </>
    );
  }
  return (
    <>
      <BookOpenIcon />
      <span>Reading</span>
    </>
  );
};

const Rating = ({ rating }: { rating: FanficItem["rating"] }) => {
  switch (rating) {
    case "K":
      return (
        <Badge className="flex h-6 w-6 items-center justify-center bg-green-800 p-0">
          {rating}
        </Badge>
      );
    case "T":
      return (
        <Badge className="flex h-6 w-6 items-center justify-center bg-amber-500 p-0">
          {rating}
        </Badge>
      );
    case "M":
      return (
        <Badge className="flex h-6 w-6 items-center justify-center bg-red-700 p-0">
          {rating}
        </Badge>
      );
    default:
      return <></>;
  }
};
