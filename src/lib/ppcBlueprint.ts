import type { Listing, PpcBlueprintSeed } from "../types";
import { shortFromTitle } from "./ppcClassify";

export interface CampaignBlueprint {
  asin: string;
  short: string;
  family: string | null;
  note: string;
  listing: Listing;
  auto: string;
  exact: string;
  phrase: string;
}

export function campaignNames(short: string) {
  return {
    auto: `Roore | ${short} | Auto`,
    exact: `Roore | ${short} | Exact`,
    phrase: `Roore | ${short} | Phrase`,
  };
}

export function blueprintsForMine(listings: Listing[], seeds: PpcBlueprintSeed[]): CampaignBlueprint[] {
  const byAsin = new Map(seeds.map((seed) => [seed.asin, seed]));
  return listings
    .filter((row) => row.mine)
    .map((listing) => {
      const seed = byAsin.get(listing.asin);
      const short = seed?.short ?? shortFromTitle(listing);
      const names = campaignNames(short);
      return {
        asin: listing.asin,
        short,
        family: seed?.family ?? listing.parentPool ?? null,
        note:
          seed?.note ??
          "One ASIN (or tight ASIN family) per ad group. Exact bids highest / controlled; Auto discovery bids lower.",
        listing,
        ...names,
      };
    });
}
