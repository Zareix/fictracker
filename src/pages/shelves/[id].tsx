import { useRouter } from "next/router";
import { FanficList } from "~/components/fanfics/list";
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
      </header>
      <div className="mt-2 grid gap-3">
        <FanficList fanfics={shelfQuery.data?.fanfics ?? []} />
      </div>
    </div>
  );
};

export default Shelf;
