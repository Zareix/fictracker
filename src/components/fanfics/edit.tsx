import { EditCreateForm } from "~/components/fanfics/edit-create-form";
import { api, type RouterOutputs } from "~/utils/api";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { toast } from "sonner";

type Props = {
  fanfic: RouterOutputs["fanfic"]["getAll"][number];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const EditFanficDialog = ({ fanfic, isOpen, setIsOpen }: Props) => {
  const chaptersQuery = api.fanfic.getChapters.useQuery(
    {
      fanficId: fanfic.id,
    },
    {
      throwOnError: (error) => {
        toast.error(`Failed to load chapters: ${error.message}`);
        setIsOpen(false);
        return false;
      },
    },
  );

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit Fanfic</DrawerTitle>
        </DrawerHeader>
        {chaptersQuery.isLoading || !chaptersQuery.data ? (
          <div className="flex h-full items-center justify-center">
            <p>Loading...</p>
          </div>
        ) : (
          <EditCreateForm
            onFinished={() => {
              setIsOpen(false);
            }}
            fanfic={{
              ...fanfic,
              chapters: chaptersQuery.data,
            }}
          />
        )}
      </DrawerContent>
    </Drawer>
  );
};
