import {
  BookIcon,
  BookOpenCheckIcon,
  BookOpenIcon,
  LetterTextIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Loading } from "~/components/ui/loading";
import { Separator } from "~/components/ui/separator";
import { api, type RouterOutputs } from "~/utils/api";

const Home = () => {
  const statsQuery = api.stats.getStats.useQuery();

  return (
    <div>
      <header>
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </header>
      {statsQuery.isLoading ? (
        <Loading />
      ) : statsQuery.isError || !statsQuery.data ? (
        <div>Error: {statsQuery.error?.message}</div>
      ) : (
        <Stats stats={statsQuery.data} />
      )}
    </div>
  );
};

const Stats = ({ stats }: { stats: RouterOutputs["stats"]["getStats"] }) => {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4">
      <h2 className="col-span-2 text-2xl font-bold">All time</h2>
      <Card className="py-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-normal">
            <LetterTextIcon />
            Total Words
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {stats.allTime.totalWordsRead}
        </CardContent>
      </Card>
      <Card className="py-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-normal">
            <BookOpenCheckIcon />
            Read
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {stats.allTime.totalCompletelyReadFanfic}
        </CardContent>
      </Card>
      <Card className="py-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-normal">
            <BookOpenIcon />
            Reading
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {stats.allTime.totalReadingFanfic}
        </CardContent>
      </Card>
      <Card className="py-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-normal">
            <BookIcon />
            To Be Read
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {stats.allTime.totalNotStartedFanfic}
        </CardContent>
      </Card>
      <Separator orientation="horizontal" className="col-span-2 mt-2 mb-1" />
      <h2 className="col-span-2 text-2xl font-bold">This month</h2>
      <Card className="py-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-normal">
            <LetterTextIcon />
            Total Words
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {stats.thisMonth.totalWordsRead}
        </CardContent>
      </Card>
      <Card className="py-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg font-normal">
            <BookOpenCheckIcon />
            Read
          </CardTitle>
        </CardHeader>
        <CardContent className="text-2xl font-bold">
          {stats.thisMonth.totalCompletelyReadFanfic}
        </CardContent>
      </Card>
    </div>
  );
};

export default Home;
