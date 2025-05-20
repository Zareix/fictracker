import { type ComponentProps, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Button } from "~/components/ui/button";
import { EditCreateShelfDialog } from "~/components/shelves/edit-create-form";
import { EditIcon } from "lucide-react";

export const EditShelfDialog = ({
  shelf,
}: {
  shelf: NonNullable<ComponentProps<typeof EditCreateShelfDialog>["shelf"]>;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button size="icon">
          <EditIcon size={20} />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit shelf</DrawerTitle>
        </DrawerHeader>
        <EditCreateShelfDialog setIsOpen={setIsOpen} shelf={shelf} />
      </DrawerContent>
    </Drawer>
  );
};
