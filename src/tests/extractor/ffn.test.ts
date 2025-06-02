import { expect, test } from "bun:test";
import { extractFanficData } from "~/server/services/extractor";

test(
  "Scrap test ffn",
  async () => {
    const fanficData = await extractFanficData(
      "https://www.fanfiction.net/s/10740714/1/Persephone",
    );

    expect(fanficData.url).toBe(
      "https://www.fanfiction.net/s/10740714/1/Persephone",
    );
    expect(fanficData.title).toBe("Persephone");
    expect(fanficData.author).toBe("sunflowerb");
    expect(fanficData.summary).toStartWith("She was meant to be the price");
    expect(fanficData.likesCount).toBeGreaterThan(6900);
    expect(fanficData.website).toBe("FanFiction.net");
    expect(fanficData.language).toBe("English");
    expect(fanficData.isCompleted).toBe(true);
    expect(fanficData.rating).toBe("M");

    expect(fanficData.fandom).toBeArrayOfSize(1);
    expect(fanficData.fandom[0]).toBe("How to Train Your Dragon");

    expect(fanficData.ships).toBeArrayOfSize(1);
    expect(fanficData.ships[0]).toBe("Astrid/Hiccup");

    expect(fanficData.tags).toBeArrayOfSize(0);

    expect(fanficData.chapters).toBeArrayOfSize(43);
    expect(fanficData.chapters[0]?.number).toBe(1);
    expect(fanficData.chapters[0]?.wordsCount).toBe(5598);
    expect(fanficData.chapters[0]?.url).toBe(
      "https://www.fanfiction.net/s/10740714/1/Persephone",
    );
    expect(fanficData.chapters[42]?.number).toBe(43);
    expect(fanficData.chapters[42]?.wordsCount).toBe(2970);
    expect(fanficData.chapters[42]?.url).toBe(
      "https://www.fanfiction.net/s/10740714/43/Persephone",
    );

    expect(
      fanficData.chapters.reduce((acc, curr) => acc + curr.wordsCount, 0),
    ).toBe(223981);
  },
  60 * 1000,
);
