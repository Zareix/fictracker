import { EditCreateForm } from "~/components/fanfics/edit-create-form";
import type { RouterOutputs } from "~/utils/api";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";

type Props = {
  fanfic: RouterOutputs["fanfic"]["getAll"][number];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const EditFanficDialog = ({ fanfic, isOpen, setIsOpen }: Props) => {
  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit Fanfic</DrawerTitle>
        </DrawerHeader>
        <EditCreateForm
          onFinished={() => {
            setIsOpen(false);
          }}
          // TODO Get all chapters details
          fanfic={{
            ...fanfic,
            chapters: Array.from({ length: fanfic.chaptersCount }).map(
              (_, i) => ({
                number: i + 1,
                wordsCount: 0,
              }),
            ),
          }}
        />
      </DrawerContent>
    </Drawer>
  );
};
