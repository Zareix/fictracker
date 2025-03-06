import { expect, test } from "bun:test";
import { extractFanficData } from "~/server/services/extractor";

test(
  "Scrap test a3o",
  async () => {
    const fanficData = await extractFanficData(
      "https://archiveofourown.org/works/10057010/chapters/22409387",
    );

    expect(fanficData.title).toBe("All the Young Dudes");
    expect(fanficData.author).toBe("MsKingBean89");
    expect(fanficData.summary).toStartWith("LONG fic ");
    expect(fanficData.likesCount).toBeGreaterThan(25500);
    expect(fanficData.language).toBe("English");

    expect(fanficData.fandom).toBeArrayOfSize(1);
    expect(fanficData.fandom[0]).toBe("Harry Potter - J. K. Rowling");

    expect(fanficData.ships).toBeArrayOfSize(3);
    expect(fanficData.ships[0]).toBe("Sirius Black/Remus Lupin");

    expect(fanficData.tags).toBeArrayOfSize(19);
    expect(fanficData.tags[0]).toBe("Marauders' Era");
  },
  60 * 1000,
);
