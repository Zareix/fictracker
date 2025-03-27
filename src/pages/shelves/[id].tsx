import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FanficList } from "~/components/fanfics/list";
import { Button } from "~/components/ui/button";
import { api } from "~/utils/api";

const Shelf = () => {
  const router = useRouter();
  const shelfQuery = api.shelve.get.useQuery(router.query.id as string, {
    enabled: !!router.query.id,
  });

  if (shelfQuery.isError) {
    return <div>Error: {shelfQuery.error?.message}</div>;
  }

  return (
    <div>
      <header>
        <h1 className="text-3xl font-bold">{shelfQuery.data?.name}</h1>
        <Button variant="link" className="p-0">
          <Link href="/shelves" className="flex items-center gap-2">
            <ChevronLeftIcon size={20} />
            Back
          </Link>
        </Button>
      </header>
      <div className="mt-2 grid gap-3">
        <FanficList fanfics={shelfQuery.data?.fanfics ?? []} />
      </div>
    </div>
  );
};

export default Shelf;
