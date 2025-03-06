import React from "react";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { type RouterOutputs } from "~/utils/api";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Calendar1Icon,
  EditIcon,
  EllipsisVertical,
  InfoIcon,
  RefreshCcwIcon,
  TextIcon,
  TrashIcon,
  UserIcon,
  WalletCardsIcon,
} from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "~/components/ui/card";
import { currencyToSymbol, formatNextPaymentDate } from "~/lib/utils";
import Image from "next/image";
import { EditFanficDialog } from "~/components/fanfics/edit";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { CategoryIcon } from "~/components/fanfics/shelves/icon";
import { DeleteDialog } from "~/components/fanfics/delete";
import { Separator } from "~/components/ui/separator";

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
        <React.Fragment key={fanfic.id}>
          <FanficListItem key={fanfic.id} fanfic={fanfic} />
          <Separator className="ml-auto w-[calc(100%-1rem-40px)] md:w-full" />
        </React.Fragment>
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

  if (fanfic.id === -1) {
    return (
      <Card className="mt-3 border-none opacity-50 shadow-none">
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
    <Card className="border-none shadow-none">
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
                  className="mr-2 w-32"
                  onClick={(e) => e.stopPropagation()}
                >
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
            <div
              className="text-foreground/80 flex flex-wrap gap-x-4 gap-y-2 pt-1 pl-12 text-base
                md:gap-x-6 md:pl-6"
            >
              TODO
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
