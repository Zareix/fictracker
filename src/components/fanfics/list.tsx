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
  BookMarkedIcon,
  BookOpenCheckIcon,
  CheckIcon,
  EditIcon,
  ExternalLinkIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { EditFanficDialog } from "~/components/fanfics/edit";
import { DeleteDialog } from "~/components/fanfics/delete";
import { toast } from "sonner";
import Link from "next/link";
import { type Shelve } from "~/server/db/schema";

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

  const addToShelf = (shelfId: number) => {
    toggleFanficInShelfMutation.mutate({ fanficId: fanfic.id, shelfId });
  };

  if (fanfic.id === -1) {
    return (
      <Card className="mt-3 opacity-50">
        <CardContent>
          <h2 className="text-center text-xl font-semibold">{fanfic.title}</h2>
          <div className="text-foreground/80 flex flex-wrap gap-x-4 gap-y-2 pt-1 text-base md:gap-x-6">
            <div className="flex gap-1">
              <BookOpenCheckIcon />
              <span>
                {fanfic.progress}/{fanfic.chaptersCount}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Card>
            <CardContent>
              <h2 className="text-xl font-semibold md:text-center">
                {fanfic.title}
              </h2>
            </CardContent>
            <CardFooter className="text-foreground/80 flex flex-wrap gap-x-4 gap-y-2 pt-1 text-base md:gap-x-6">
              <div className="flex gap-1">
                <BookOpenCheckIcon />
                <span>
                  {fanfic.progress}/{fanfic.chaptersCount}
                </span>
              </div>
            </CardFooter>
          </Card>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <Link href={fanfic.lastChapterUrl ?? fanfic.url} target="_blank">
            <DropdownMenuItem>
              <ExternalLinkIcon />
              <span>Read</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem
            onClick={() => incrementChapterMutation.mutate(fanfic.id)}
          >
            <PlusIcon />
            <span>Increment chapter</span>
          </DropdownMenuItem>
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
                  In {fanfic.shelves.length} shel
                  {fanfic.shelves.length > 1 ? "ves" : "f"}
                </span>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  {shelves.map((shelf) => (
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
