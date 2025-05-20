import React from "react";
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

type FanficItem = RouterOutputs["fanfic"]["getAll"][number];

type Props = {
  fanfics: Array<FanficItem>;
};

export const FanficList = ({ fanfics }: Props) => {
  const shelvesQuery = api.shelve.getAll.useQuery();
  // const [sort] = useQueryState(
  //   "sort",
  //   parseAsStringEnum(SORTS.map((s) => s.key)),
  // );

  if (fanfics.length === 0) {
    return (
      <div className="text-muted-foreground text-center">No fanfics found</div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {fanfics.map((fanfic) => (
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
      apiUtils.shelve.getAll.invalidate().catch(console.error);
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
      apiUtils.shelve.getAll.invalidate().catch(console.error);
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold md:text-center">
                {fanfic.title}
              </h2>
              <div className="flex flex-wrap items-center gap-1">
                {firstFandom && <Badge variant="default">{firstFandom}</Badge>}
                {firstShip && <Badge variant="secondary">{firstShip}</Badge>}
              </div>
            </CardContent>
            <CardFooter className="text-foreground/80 flex items-center gap-x-4 gap-y-2 pt-1 text-base md:gap-x-6">
              <div className="flex gap-2">
                {progressToStatus(
                  fanfic.isCompleted,
                  fanfic.progress,
                  fanfic.chaptersCount,
                )}
              </div>
              {fanfic.grade && (
                <div className="flex gap-2">
                  {Array(fanfic.grade)
                    .fill(null)
                    .map((_, i) => (
                      <StarIcon key={i} size={16} className="fill-yellow-300" />
                    ))}
                </div>
              )}
              <div className="ml-auto">
                {fanfic.progress}/{fanfic.chaptersCount}
              </div>
            </CardFooter>
          </Card>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
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
                  In {fanfic.shelves.length}
                  {fanfic.shelves.length > 1 ? " shelves" : " shelf"}
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
            className="text-destructive"
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

const progressToStatus = (
  isCompleted: boolean,
  progress: number,
  chaptersCount: number,
) => {
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
