import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FanficList } from "~/components/fanfics/list";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";
import { Skeleton } from "~/components/ui/skeleton";
import { FanficSkeleton } from "~/components/fanfics/skeleton";
import { EditShelfDialog } from "~/components/shelves/edit";
import { DeleteShelfDialog } from "~/components/shelves/delete";

const Shelf = () => {
  const router = useRouter();
  const shelfQuery = api.shelve.get.useQuery(router.query.id as string, {
    enabled: !!router.query.id,
  });

  if (shelfQuery.isLoading) {
    return (
      <div>
        <header>
          <Button variant="link" className="p-0">
            <Link href="/shelves" className="flex items-center gap-2">
              <ChevronLeftIcon size={20} />
              Back
            </Link>
          </Button>
          <Skeleton className="mt-2 h-7 w-64" />
        </header>
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <FanficSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (shelfQuery.isError || !shelfQuery.data) {
    return <div>Error: {shelfQuery.error?.message}</div>;
  }

  const shelf = shelfQuery.data;

  return (
    <div>
      <header>
        <Button variant="link" className="p-0">
          <Link href="/shelves" className="flex items-center gap-2">
            <ChevronLeftIcon size={20} />
            Back
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">{shelf.name}</h1>
          {shelf.id > 0 && (
            <div className="ml-auto flex gap-2">
              <EditShelfDialog shelf={shelf} />
              <DeleteShelfDialog shelf={shelf} />
            </div>
          )}
        </div>
      </header>
      <div className="mt-2">
        <FanficList fanfics={shelf.fanfics} />
      </div>
    </div>
  );
};

export default Shelf;
