import { Ratings } from "~/lib/constant";
import {
  useQueryState,
  parseAsStringLiteral,
  parseAsString,
  parseAsArrayOf,
} from "nuqs";

export const useFilters = () => {
  const [rating, setRating] = useQueryState(
    "rating",
    parseAsStringLiteral(Ratings),
  );
  const [language, setLanguage] = useQueryState("language", parseAsString);
  const [fandom, setFandom] = useQueryState("fandom", parseAsString);
  const [ships, setShips] = useQueryState(
    "ships",
    parseAsArrayOf(parseAsString),
  );
  const [tags, setTags] = useQueryState("tags", parseAsArrayOf(parseAsString));

  const setFilters = (filters: {
    rating?: typeof rating;
    language?: typeof language;
    fandom?: typeof fandom;
    ships?: typeof ships;
    tags?: typeof tags;
  }) => {
    if (filters.rating) {
      setRating(filters.rating).catch(console.error);
    }
    if (filters.language) {
      setLanguage(filters.language).catch(console.error);
    }
    if (filters.fandom) {
      setFandom(filters.fandom).catch(console.error);
    }
    if (filters.ships !== undefined) {
      setShips(filters.ships).catch(console.error);
    }
    if (filters.tags !== undefined) {
      setTags(filters.tags).catch(console.error);
    }
  };

  const clearFilter = (
    filter: "all" | "rating" | "language" | "fandom" | "ships" | "tags",
  ) => {
    if (filter === "rating" || filter === "all") {
      setRating(null).catch(console.error);
      // no return, so all can clear all
    }
    if (filter === "language" || filter === "all") {
      setLanguage(null).catch(console.error);
    }
    if (filter === "fandom" || filter === "all") {
      setFandom(null).catch(console.error);
    }
    if (filter === "ships" || filter === "all") {
      setShips(null).catch(console.error);
    }
    if (filter === "tags" || filter === "all") {
      setTags(null).catch(console.error);
    }
  };

  return [
    {
      rating,
      language,
      fandom,
      ships,
      tags,
    },
    setFilters,
    clearFilter,
  ] as const;
};

export type Filters = ReturnType<typeof useFilters>[0];
