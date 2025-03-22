import Link from "next/link";
import CreateShelveDialog from "~/components/fanfics/shelves/create";
import { Card, CardDescription, CardTitle } from "~/components/ui/card";
import { api } from "~/utils/api";

const Shelves = () => {
  const shelvesQuery = api.shelve.getAll.useQuery();

  if (shelvesQuery.isError) {
    return <div>Error: {shelvesQuery.error?.message}</div>;
  }

  return (
    <div>
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shelves</h1>
        <div>
          <CreateShelveDialog />
        </div>
      </header>
      <div className="mt-2 grid grid-cols-2 gap-3">
        {shelvesQuery.isLoading ? (
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-b-2 border-white" />
          </div>
        ) : (
          shelvesQuery.data?.map((shelf) => (
            <Link key={shelf.id} href={`/shelves/${shelf.id}`}>
              <Card>
                <CardTitle>{shelf.name}</CardTitle>
                <CardDescription>
                  {shelf.fanficsCount > 0 ? shelf.fanficsCount : "No"} fanfics
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
