import { BookIcon } from "lucide-react";
import React from "react";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export const FanficSkeleton = () => {
  return (
    <Card>
      <CardContent>
        <h2 className="py-1 text-xl font-semibold md:text-center">
          <Skeleton className="h-6 w-34" />
        </h2>
        <div className="flex flex-wrap items-center gap-1">
          <Badge variant="default">. . .</Badge>
          <Badge variant="secondary">. . .</Badge>
        </div>
      </CardContent>
      <CardFooter
        className="text-foreground/80 flex flex-wrap items-center gap-x-4 gap-y-2 pt-1 text-base
          md:gap-x-6"
      >
        <div className="flex gap-2">
          <BookIcon />
          <span>TBR</span>
        </div>
      </CardFooter>
    </Card>
  );
};
