import { TrashIcon } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { api, type RouterOutputs } from "~/utils/api";

export const DeleteShelfDialog = ({
  shelf,
}: {
  shelf: Pick<RouterOutputs["shelve"]["get"], "id" | "name">;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const apiUtils = api.useUtils();
  const deleteFanficMutation = api.shelve.delete.useMutation({
    onSuccess: () => {
      toast.success("Fanfic deleted!");
      apiUtils.shelve.getAll.invalidate().catch(console.error);
      apiUtils.shelve.get.invalidate().catch(console.error);
      router.push("/shelves").catch(console.error);
      setIsOpen(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  function onDelete() {
    deleteFanficMutation.mutate(shelf.id);
  }

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button size="icon" variant="destructive">
          <TrashIcon size={20} />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            Delete shelf:{" "}
            <span className="font-medium italic">{shelf.name}</span>
          </DrawerTitle>
        </DrawerHeader>
        <DrawerDescription>
          Are you sure you want to delete this shelf?
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
