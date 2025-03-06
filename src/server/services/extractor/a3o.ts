import type { FanficExtractor } from ".";
// import puppeteer, { type Page } from "puppeteer";
import * as cheerio from "cheerio";

// const getTextContent = async (page: Page, selector: string) => {
//   return await page.$eval(selector, (el) => el.textContent?.trim());
// };

// const getTextContentArray = async (page: Page, selector: string) => {
//   return await page.$$eval(selector, (els) =>
//     els.map((el) => el.textContent?.trim()).filter(Boolean),
//   );
// };

// const getChaptersCount = async (page: Page): Promise<[number, boolean]> => {
//   const chaptersText = await getTextContent(page, "dd.chapters");
//   if (!chaptersText?.includes("/")) return [1, false];
//   const [publishedChapters, totalChapters] = chaptersText.split("/");
//   if (!publishedChapters || !totalChapters) return [1, false];

//   const chaptersCount = Number.parseInt(publishedChapters);
//   if (totalChapters === "?") return [chaptersCount, false];
//   return [chaptersCount, chaptersCount === Number.parseInt(totalChapters)];
// };

// export const extractFanficData_old: FanficExtractor = async (
//   workUrl: string,
// ) => {
//   let url = workUrl.split("/chapters/")[0]!;
//   if (!url.includes("view_adult=true")) {
//     url += `?view_adult=true`;
//   }
//   console.log("[a3o] Scrapping", url);

//   const browser = await puppeteer.launch({
//     headless: "shell",
//     args: [
//       "--no-sandbox",
//       "--disable-setuid-sandbox",
//       "--ignore-certificate-errors",
//     ],
//   });
//   const page = await browser.newPage();
//   await page.setViewport({ width: 1080, height: 1024 });

//   await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60 * 1000 });

//   console.log("[a3o] Accepting ToS");
//   try {
//     await page.locator("#tos_agree").setTimeout(500).click();
//     await page.locator("#data_processing_agree").click();
//     await Bun.sleep(500);
//     await page.locator("#accept_tos").click();
//     console.log("[a3o] Accepted ToS");
//   } catch {
//     console.log("[a3o] ToS already accepted");
//   }

//   const [
//     title,
//     author,
//     summary,
//     likesCount,
//     language,
//     fandom,
//     ships,
//     tags,
//     [chaptersCount, isCompleted],
//   ] = await Promise.all([
//     getTextContent(page, "h2.title.heading"),
//     getTextContent(page, "a[rel='author']"),
//     getTextContent(page, ".summary blockquote"),
//     getTextContent(page, ".stats dd.kudos"),
//     getTextContent(page, "dd.language"),
//     getTextContentArray(page, "dd.fandom > ul > li"),
//     getTextContentArray(page, "dd.relationship.tags > ul > li"),
//     getTextContentArray(page, "dd.freeform.tags > ul > li"),
//     getChaptersCount(page),
//   ]);

//   await browser.close();

//   console.log("[a3o] All content read");

//   return {
//     url,
//     website: "Archive of Our Own",
//     title: title ?? "",
//     author: author ?? "",
//     summary: summary ?? "",
//     likesCount: likesCount ? Number.parseInt(likesCount.replace(",", "")) : 0,
//     tags,
//     isCompleted,
//     fandom,
//     ships,
//     language: language ?? "",
//     chaptersCount: chaptersCount,
//   };
// };

const getChaptersCount = async (
  $: cheerio.CheerioAPI,
): Promise<[number, boolean]> => {
  const chaptersText = $("dd.chapters").text();
  if (!chaptersText?.includes("/")) return [1, false];
  const [publishedChapters, totalChapters] = chaptersText.split("/");
  if (!publishedChapters || !totalChapters) return [1, false];

  const chaptersCount = Number.parseInt(publishedChapters);
  if (totalChapters === "?") return [chaptersCount, false];
  return [chaptersCount, chaptersCount === Number.parseInt(totalChapters)];
};

export const extractFanficData: FanficExtractor = async (workUrl: string) => {
  let url = workUrl.split("/chapters/")[0]!;
  if (!url.includes("view_adult=true")) {
    url += `?view_adult=true`;
  }
  console.log("[a3o] Scrapping", url);

  console.log("[a3o] Fetching page content");
  const pageContent = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:135.0) Gecko/20100101 Firefox/135.0",
    },
  }).then((r) => r.text());
  console.log("[a3o] Parsing page content");
  const $ = cheerio.load(pageContent);

  console.log("[a3o] Extracting data");
  const title = $("h2.title.heading").text().trim();
  const author = $("h3.byline").text().trim();
  const summary = $(".summary blockquote").text().trim();
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

  // const chaptersCount = Number.parseInt($("dd.chapters").text().split("/")[0]);
  // const isCompleted = Boolean($(".stats dd.chapters").text().includes("?"));

  return {
    url,
    website: "Archive of Our Own",
    title: title ?? "",
    author: author ?? "",
    summary: summary ?? "",
    likesCount: likesCount ? Number.parseInt(likesCount.replace(",", "")) : 0,
    tags,
    isCompleted: false,
    fandom,
    ships,
    language: language ?? "",
    chaptersCount: 0,
  };
};
