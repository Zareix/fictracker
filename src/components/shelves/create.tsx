import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Button } from "~/components/ui/button";
import { EditCreateShelfDialog } from "~/components/shelves/edit-create-form";

export const CreateShelfDialog = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button>Create shelf</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create a new shelf</DrawerTitle>
        </DrawerHeader>
        <EditCreateShelfDialog setIsOpen={setIsOpen} />
      </DrawerContent>
    </Drawer>
  );
};
