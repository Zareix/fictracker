import type { Fanfic } from "~/server/db/schema";
import * as ao3 from "./ao3";
import * as ffn from "./ffn";

export const extractFanficData = async (
  url: string,
): Promise<
  Omit<
    Fanfic,
    "id" | "createdAt" | "updatedAt" | "grade" | "userId" | "url"
  > & {
    url: string | undefined;
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
    if (url.startsWith("https://www.fanfiction.net/")) {
      return await ffn.extractFanficData(url);
    }
    console.log("No extractor found for", url);
  } catch (e) {
    console.error(e);
  }
  return {
    title: "",
    url: undefined,
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
    chapters: [],
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
    if (url.startsWith("https://www.fanfiction.net/")) {
      return await ffn.extractFanficChapters(url);
    }
    console.log("No extractor found for", url);
  } catch (e) {
    console.error(e);
  }
  return [];
};

export type FanficExtractor = typeof extractFanficData;
export type FanficExtractorChapters = typeof extractFanficChapters;
