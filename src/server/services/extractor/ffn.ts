import type {
  FanficExtractor,
  FanficExtractorChapters,
} from "~/server/services/extractor";
import JSZip from "jszip";
import * as cheerio from "cheerio";

type FicHubResponse = {
  epub_url: string;
  err: number;
  html_url: string;
  info: string;
  meta: {
    author: string;
    authorId: number;
    authorLocalId: string;
    authorUrl: string;
    chapters: number;
    created: Date;
    description: string;
    extraMeta: string;
    id: string;
    rawExtendedMeta: {
      category: string;
      chapters: string;
      characters: string;
      cimage: string;
      crossover: boolean;
      fandom_stubs: string[];
      favorites?: string;
      follows: string;
      genres: string;
      id: string;
      language: string;
      published: string;
      rated: string;
      raw_fandom: string;
      reviews: string;
      updated: string;
      words: string;
    };
    source: string;
    sourceId: number;
    status: string;
    title: string;
    updated: Date;
    words: number;
  };
  mobi_url: string;
  pdf_url: string;
  q: string;
  slug: string;
  urlId: string;
};

export const extractFanficData: FanficExtractor = async (workUrl: string) => {
  const url = workUrl;
  console.log("[ffn] Scrapping", url);

  console.log("[ffn] Fetching page content");
  const apiUrl = new URL("https://fichub.net/api/v0/epub");
  apiUrl.searchParams.set("q", url);
  const res = await fetch(apiUrl.toString());
  if (!res.ok) {
    throw new Error(`[ffn] Failed to fetch data from ${apiUrl}`);
  }
  const data = (await res.json()) as FicHubResponse;

  console.log("[ffn] Fetching html");
  const zipRes = await fetch("https://fichub.net" + data.html_url);
  if (!zipRes.ok) {
    throw new Error(`[ffn] Failed to fetch zip from ${data.html_url}`);
  }
  const zipArrayBuffer = await zipRes.blob().then((blob) => blob.arrayBuffer());
  const unzipped = await new JSZip().loadAsync(zipArrayBuffer);

  let htmlContent: string | undefined;
  for (const fileName in unzipped.files) {
    if (fileName.endsWith(".html")) {
      htmlContent = await unzipped.files[fileName]?.async("text");
      break;
    }
  }

  if (!htmlContent) {
    throw new Error("[ffn] No HTML content found in the zip file");
  }

  console.log("[ffn] Parsing HTML content");
  const $ = cheerio.load(htmlContent);

  console.log("[ffn] Extracting data");
  const chapters = $('div[id^="chap_"]')
    .map((i, el) => {
      const $el = $(el);
      const chapterNumber = i + 1;
      const chapterUrl = url.replace(
        /\/s\/(\d+)\/\d+\//,
        `/s/$1/${chapterNumber}/`,
      );

      return {
        number: chapterNumber,
        wordsCount: $el
          .find("> div:last-child")
          .text()
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length,
        title: $el.find("h2").text().trim(),
        url: chapterUrl,
      };
    })
    .toArray();

  return {
    title: data.meta.title.trim(),
    url,
    author: data.meta.author.trim(),
    website: "FanFiction.net",
    summary: data.meta.description.trim().replace(/<[^>]+>/g, ""),
    likesCount: data.meta.rawExtendedMeta.favorites
      ? Number.parseInt(
          data.meta.rawExtendedMeta.favorites.replace(",", ""),
          10,
        )
      : 0,
    rating: parseRating(data.meta.rawExtendedMeta.rated.trim()),
    tags: [],
    isCompleted: parseStatus(data.meta.status.trim()),
    fandom: [data.meta.rawExtendedMeta.raw_fandom.trim()],
    ships: parseShips(data.meta.rawExtendedMeta.characters).sort(),
    language: data.meta.rawExtendedMeta.language.trim() || "",
    chapters,
  };
};

const parseShips = (ships: string) => {
  if (!ships) return [];

  // Find all characters within square brackets
  const shipMatches = ships.match(/\[([^\]]+)\]/g);
  if (!shipMatches) return [];

  return shipMatches.map((match) => {
    // Remove brackets and split by comma
    const characters = match
      .slice(1, -1)
      .split(",")
      .map((char) => char.trim())
      .sort();
    return characters.join("/");
  });
};

const parseRating = (rating: string) => {
  switch (rating) {
    case "K":
    case "K+":
      return "K";
    case "T":
      return "T";
    case "M":
    case "E":
      return "M";
    default:
      return null;
  }
};

const parseStatus = (rating: string) => {
  switch (rating.toLowerCase()) {
    case "complete":
      return true;
    default:
      return false;
  }
};

export const extractFanficChapters: FanficExtractorChapters = async (
  workUrl: string,
) => {
  return await extractFanficData(workUrl).then((data) => data.chapters);
};
