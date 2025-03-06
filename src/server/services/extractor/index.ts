import type { Fanfic } from "~/server/db/schema";

export const extractFanficData = async (
  url: string,
): Promise<Omit<Fanfic, "id" | "createdAt" | "updatedAt">> => {
  if (url.startsWith("https://archiveofourown.org/")) {
  }
  return {
    title: "",
    url: "",
    author: "",
    website: "",
    summary: "",
    likesCount: 0,
    tags: "",
    writingCompleted: false,
    fandom: "",
    ships: "",
    language: "",
  };
};

export type FanficExtractor = typeof extractFanficData;
