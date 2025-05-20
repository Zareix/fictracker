import { Label } from "@radix-ui/react-label";
import { FilterIcon, TrashIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { MultiSelect } from "~/components/ui/multi-select";
import { type Rating, Ratings } from "~/lib/constant";
import { useFilters } from "~/lib/hooks/use-filters";
import { cn } from "~/lib/utils";
import { api } from "~/utils/api";

export const FiltersButton = () => {
  const [filters, setFilters, clearFilter] = useFilters();

  const fanficQuery = api.fanfic.getAll.useQuery();

  if (fanficQuery.isError) {
    return null;
  }

  // Dynamically extract unique languages, fandoms, ships, and tags from fanfics
  const languages = fanficQuery.data
    ? Array.from(
        new Set(
          fanficQuery.data
            .map((fanfic: { language?: string }) => fanfic.language)
            .filter(Boolean),
        ),
      )
    : [];

  const fandoms = fanficQuery.data
    ? Array.from(
        new Set(
          fanficQuery.data
            .flatMap((fanfic: { fandom?: string[] }) => fanfic.fandom ?? [])
            .filter(Boolean),
        ),
      )
    : [];

  const ships = fanficQuery.data
    ? Array.from(
        new Set(
          fanficQuery.data
            .filter(
              (fanfic) =>
                !filters.fandom || fanfic.fandom.includes(filters.fandom),
            )
            .flatMap((fanfic: { ships?: string[] }) => fanfic.ships ?? [])
            .filter(Boolean),
        ),
      )
    : [];

  const tags = fanficQuery.data
    ? Array.from(
        new Set(
          fanficQuery.data
            .filter(
              (fanfic) =>
                !filters.fandom || fanfic.fandom.includes(filters.fandom),
            )
            .flatMap((fanfic: { tags?: string[] }) => fanfic.tags ?? [])
            .filter(Boolean),
        ),
      )
    : [];

  return (
    <div className="flex items-center gap-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon" variant="ghost" disabled={fanficQuery.isLoading}>
            <FilterIcon
              size={24}
              className={cn(
                filters.rating
                  ? "fill-primary text-primary"
                  : "`text-foreground",
              )}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="mr-3 flex w-[calc(100vw-2rem)] flex-col gap-2 p-4 md:w-fit">
          <Label>Fandom</Label>
          <div className="flex items-center gap-2">
            <Select
              onValueChange={(value) =>
                setFilters({
                  fandom: value,
                })
              }
              value={filters.fandom ?? ""}
              disabled={fandoms.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {fandoms.map((fandom) => (
                  <SelectItem value={fandom} key={fandom}>
                    {fandom}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.fandom && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => clearFilter("fandom")}
              >
                <TrashIcon className="size-5" />
              </Button>
            )}
          </div>

          <Label>Rating</Label>
          <div className="flex items-center gap-2">
            <Select
              onValueChange={(value) =>
                setFilters({
                  rating: value as Rating,
                })
              }
              value={filters.rating ?? ""}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {Ratings.map((rating) => (
                  <SelectItem value={rating} key={rating}>
                    {rating}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.rating && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => clearFilter("rating")}
              >
                <TrashIcon className="size-5" />
              </Button>
            )}
          </div>

          <Label>Ships</Label>
          <div className="flex w-full items-center gap-2">
            <MultiSelect
              options={ships.map((ship) => ({
                label: ship,
                value: ship,
              }))}
              onValueChange={(values) =>
                setFilters({
                  ships: values,
                })
              }
              value={filters.ships ?? []}
              placeholder="Select..."
              className="w-full"
              search
            />
          </div>

          <Label>Tags</Label>
          <div className="flex w-full items-center gap-2">
            <MultiSelect
              options={tags.map((tag) => ({
                label: tag,
                value: tag,
              }))}
              onValueChange={(values) =>
                setFilters({
                  tags: values,
                })
              }
              value={filters.tags ?? []}
              placeholder="Select..."
              className="w-full"
              search
            />
          </div>

          <Label>Language</Label>
          <div className="flex items-center gap-2">
            <Select
              onValueChange={(value) =>
                setFilters({
                  language: value,
                })
              }
              value={filters.language ?? ""}
              disabled={languages.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem value={lang} key={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.language && (
              <Button
                variant="destructive"
                size="icon"
                onClick={() => clearFilter("language")}
              >
                <TrashIcon className="size-5" />
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
