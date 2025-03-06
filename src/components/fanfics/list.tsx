import React from "react";
import { api, type RouterOutputs } from "~/utils/api";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  BookOpenCheckIcon,
  EditIcon,
  EllipsisVertical,
  InfoIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { EditFanficDialog } from "~/components/fanfics/edit";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { DeleteDialog } from "~/components/fanfics/delete";
import { toast } from "sonner";

type Props = {
  fanfics: RouterOutputs["fanfic"]["getAll"];
};

export const FanficList = ({ fanfics }: Props) => {
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
    <Accordion type="single" collapsible>
      {fanfics.map((fanfic) => (
        <FanficListItem key={fanfic.id} fanfic={fanfic} />
      ))}
    </Accordion>
  );
};

const FanficListItem = ({
  fanfic,
}: {
  fanfic: RouterOutputs["fanfic"]["getAll"][number];
}) => {
  const [isOpen, setIsOpen] = useState({
    delete: false,
    edit: false,
  });
  const apiUtils = api.useUtils();
  const incrementChapterMutation = api.progress.increment.useMutation({
    onSuccess: () => {
      apiUtils.fanfic.getAll.invalidate().catch(console.error);
      toast.success("Chapter incremented!");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  if (fanfic.id === -1) {
    return (
      <Card className="mt-3 opacity-50">
        <CardContent>
          <div className="flex items-center gap-2">
            <h2 className="grow text-xl font-semibold">{fanfic.title}</h2>
            <Button
              size="icon"
              variant="ghost"
              className="w-4 md:w-10"
              disabled
            >
              <EllipsisVertical size={24} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <AccordionItem value={fanfic.id.toString()}>
          <AccordionTrigger asChild>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">{fanfic.title}</h2>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground w-5 md:w-10"
                  >
                    <InfoIcon size={20} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="mr-2"
                  onClick={(e) => e.stopPropagation()}
                >
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
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="text-foreground/80 flex flex-wrap gap-x-4 gap-y-2 pt-1 text-base md:gap-x-6">
              <div className="flex gap-1">
                <BookOpenCheckIcon />
                <span>
                  {fanfic.progress}/{fanfic.chaptersCount}
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
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
      </CardContent>
    </Card>
  );
};
