import Link from "next/link";
import { CreateShelfDialog } from "~/components/shelves/create";
import { Card, CardDescription, CardTitle } from "~/components/ui/card";
import { Loading } from "~/components/ui/loading";
import { api } from "~/utils/api";

const Shelves = () => {
  const shelvesQuery = api.shelve.getAllWithContent.useQuery();

  if (shelvesQuery.isError) {
    return <div>Error: {shelvesQuery.error?.message}</div>;
  }

  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shelves</h1>
        <div>
          <CreateShelfDialog />
        </div>
      </header>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {shelvesQuery.isLoading ? (
          <Loading className="col-span-2" />
        ) : (
          shelvesQuery.data?.map((shelf) => (
            <Link key={shelf.id} href={`/shelves/${shelf.id}`}>
              <Card>
                <CardTitle>{shelf.name}</CardTitle>
                <CardDescription>
                  {shelf.fanficsCount > 0
                    ? shelf.fanficsCount > 1
                      ? `${shelf.fanficsCount} fanfics`
                      : `${shelf.fanficsCount} fanfic`
                    : "No fanfic"}
                </CardDescription>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Shelves;
