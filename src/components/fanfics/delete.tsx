import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { api, type RouterOutputs } from "~/utils/api";

export const DeleteDialog = ({
  fanfic,
  isOpen,
  setIsOpen,
}: {
  fanfic: Pick<RouterOutputs["fanfic"]["getAll"][number], "id" | "title">;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const apiUtils = api.useUtils();
  const deleteFanficMutation = api.fanfic.delete.useMutation({
    onSuccess: () => {
      toast.success("Fanfic deleted!");
      apiUtils.fanfic.getAll.invalidate().catch(console.error);
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onDelete() {
    deleteFanficMutation.mutate(fanfic.id);
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            Delete fanfic:{" "}
            <span className="font-medium italic">{fanfic.title}</span>
          </DrawerTitle>
        </DrawerHeader>
        <DrawerDescription>
          Are you sure you want to delete fanfic this fanfic?
        </DrawerDescription>
        <DrawerFooter>
          <Button
            variant="secondary"
            onClick={() => setIsOpen(false)}
            disabled={deleteFanficMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onDelete}
            isLoading={deleteFanficMutation.isPending}
          >
            Delete
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
