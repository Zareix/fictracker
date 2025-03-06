import { DialogTitle } from "~/components/ui/dialog";
import { EditCreateForm } from "~/components/fanfics/edit-create-form";
import type { RouterOutputs } from "~/utils/api";
import { Drawer, DrawerContent } from "~/components/ui/drawer";

type Props = {
  fanfic: RouterOutputs["fanfic"]["getAll"][number];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const EditFanficDialog = ({ fanfic, isOpen, setIsOpen }: Props) => {
  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DialogTitle>Edit Fanfic</DialogTitle>
      <DrawerContent>
        <EditCreateForm
          onFinished={() => {
            setIsOpen(false);
          }}
          fanfic={fanfic}
        />
      </DrawerContent>
    </Drawer>
  );
};
