import type { Fanfic } from "~/server/db/schema";
import * as ao3 from "./ao3";

export const extractFanficData = async (
  url: string,
): Promise<
  Omit<Fanfic, "id" | "createdAt" | "updatedAt" | "grade"> & {
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
      return await ao3.extractFanficData(url);
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
    rating: null,
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
      return await ao3.extractFanficChapters(url);
    }
    console.log("No extractor found for", url);
  } catch (e) {
    console.error(e);
  }
  return [];
};

export type FanficExtractor = typeof extractFanficData;
export type FanficExtractorChapters = typeof extractFanficChapters;
