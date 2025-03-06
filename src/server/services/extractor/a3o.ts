import type { FanficExtractor } from ".";

export const extractFanficData: FanficExtractor = async (url: string) => {
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
