import { api } from "~/utils/api";
import { FanficList } from "~/components/fanfics/list";
import { FanficSkeleton } from "~/components/fanfics/skeleton";

export default function Home() {
  const fanficsQuery = api.fanfic.getAll.useQuery();

  if (fanficsQuery.isError) {
    return <div>Error: {fanficsQuery.error?.message}</div>;
  }

  return (
    <div>
      <header className="flex flex-wrap items-center justify-between gap-y-1">
        <h1 className="text-3xl font-bold">All Fanfics</h1>
        <div className="flex items-center gap-2">
          {/* <FiltersButton /> */}
          {/* <SortButton /> */}
        </div>
      </header>
      <div className="mt-2 grid gap-3">
        {fanficsQuery.isLoading ? (
          Array.from({ length: 2 }).map((_, i) => <FanficSkeleton key={i} />)
        ) : (
          <FanficList fanfics={fanficsQuery.data ?? []} />
        )}
      </div>
    </div>
  );
}
