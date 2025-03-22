import type { FanficExtractor } from ".";
import * as cheerio from "cheerio";

export const extractFanficData: FanficExtractor = async (workUrl: string) => {
  const url =
    workUrl.split("/chapters/")[0]! + "?view_adult=true&view_full_work=true";
  console.log("[a3o] Scrapping", url);

  console.log("[a3o] Fetching page content");
  const pageContent = await fetch(url).then((r) => r.text());
  console.log("[a3o] Parsing page content");
  const $ = cheerio.load(pageContent);

  console.log("[a3o] Extracting data");
  const title = $("h2.title.heading").text().trim();
  const author = $("h3.byline").text().trim();
  const summary = $(".preface:not(.chapter) .summary blockquote").text().trim();
  const likesCount = $(".stats dd.kudos").text().trim();
  const language = $("dd.language").text().trim();
  const fandom = $("dd.fandom > ul > li")
    .map((i, el) => $(el).text().trim())
    .get();
  const ships = $("dd.relationship.tags > ul > li")
    .map((i, el) => $(el).text().trim())
    .get();
  const tags = $("dd.freeform.tags > ul > li")
    .map((i, el) => $(el).text().trim())
    .get();
  const isCompleted = !$("dd.chapters").text().includes("?");
  const chapters = $("#chapters > .chapter [role=article]")
    .map((i, el) => {
      const $el = $(el);
      return {
        number: i + 1,
        wordsCount: $el
          .text()
          .trim()
          .split(/\s+/)
          .filter((word) => word.length > 0).length,
      };
    })
    .get();

  return {
    url: url.replace("&view_full_work=true", ""),
    website: "Archive of Our Own",
    title: title ?? "",
    author: author ?? "",
    summary: summary ?? "",
    likesCount: likesCount ? Number.parseInt(likesCount.replace(",", "")) : 0,
    tags,
    isCompleted,
    fandom,
    ships,
    language: language ?? "",
    chapters,
  };
};
