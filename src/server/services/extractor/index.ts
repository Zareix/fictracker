import type { Fanfic } from "~/server/db/schema";
import * as a3o from "./a3o";

export const extractFanficData = async (
  url: string,
): Promise<
  Omit<Fanfic, "id" | "createdAt" | "updatedAt"> & {
    chapters: Array<{
      number: number;
      wordsCount: number;
      url: string;
      title: string;
    }>;
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
    chapters: [
      {
        number: 1,
        wordsCount: 0,
        url: "",
        title: "",
      },
    ],
  };
};

export const extractFanficChapters = async (
  url: string,
): Promise<
  Array<{
    number: number;
    wordsCount: number;
    url: string;
    title: string;
  }>
> => {
  try {
    if (url.startsWith("https://archiveofourown.org/")) {
      return await a3o.extractFanficChapters(url);
    }
    console.log("No extractor found for", url);
  } catch (e) {
    console.error(e);
  }
  return [];
};

export type FanficExtractor = typeof extractFanficData;
export type FanficExtractorChapters = typeof extractFanficChapters;
