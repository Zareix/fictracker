import { api } from "~/utils/api";
import { Calendar1Icon, InfoIcon } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Skeleton } from "~/components/ui/skeleton";
import { FanficList } from "~/components/fanfics/list";

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
          <Card className="border-none shadow-none">
            <CardContent>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-14" />
                <div className="flex grow flex-col gap-1">
                  <h2 className="text-xl font-semibold">
                    <Skeleton className="h-6 w-20 md:w-28" />
                  </h2>
                  <div className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Calendar1Icon size={16} />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <div className="flex items-center text-lg">
                  <Skeleton className="h-6 w-12" />€
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="w-4 md:w-10"
                  disabled
                >
                  <InfoIcon size={20} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <FanficList fanfics={fanficsQuery.data ?? []} />
        )}
      </div>
    </div>
  );
}
