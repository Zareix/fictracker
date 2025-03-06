import type { Fanfic } from "~/server/db/schema";
import * as a3o from "./a3o";

export const extractFanficData = async (
  url: string,
): Promise<
  Omit<Fanfic, "id" | "createdAt" | "updatedAt"> & {
    chaptersCount: number;
  }
> => {
  try {
    if (url.startsWith("https://archiveofourown.org/")) {
      return await a3o.extractFanficData(url);
    }
    console.log("No extractor found for", url);
  } catch (e) {
    console.error(e);
  }
  return {
    title: "",
    url: "",
    author: "",
    website: "",
    summary: "",
    likesCount: 0,
    tags: [],
    isCompleted: false,
    fandom: [],
    ships: [],
    language: "",
    chaptersCount: 0,
  };
};

export type FanficExtractor = typeof extractFanficData;
