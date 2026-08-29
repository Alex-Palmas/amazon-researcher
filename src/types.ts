export type Sourced = "yes" | "no" | "unknown";

export interface Listing {
  asin: string;
  brand?: string;
  title: string;
  price: number;
  listPrice?: number;
  typicalPrice?: number;
  rating?: number;
  reviews?: number;
  units?: number;
  unitsLabel?: string;
  image: string;
  mine?: boolean;
  trending?: boolean;
  badge?: "BEST";
  sourced?: Sourced;
  fob?: number;
  unit?: number;
  ads?: number;
  parentPool?: string;
}

export interface ParentPool {
  asins: string[];
  reviews: number;
  note: string;
}

export interface CatalogMeta {
  scrapedAt: string;
  timezone: string;
  source: string;
  catalogReviews: number;
  weightedRating: number;
  parentPools: ParentPool[];
}

export interface Catalog {
  meta: CatalogMeta;
  listings: Listing[];
}

export type RouteId = "research" | "mine" | "keywords" | "audit";

export interface KeywordRow {
  id: string;
  phrase: string;
  rank: number | null;
  volume: number | null;
  watching: string[];
}

export const ROUTES: { id: RouteId; label: string }[] = [
  { id: "research", label: "Research" },
  { id: "mine", label: "My listings" },
  { id: "keywords", label: "Keywords" },
  { id: "audit", label: "Audit" },
];

export const MINE_ASINS = [
  "B0GDC2M73C",
  "B0H696X4G4",
  "B0DJ5M2MMW",
  "B0GJTZW6L2",
] as const;

export const SEED_KEYWORDS = [
  "tungsten pickleball tape",
  "pickleball paddle weights",
  "lead tape alternative pickleball",
  "foam core pickleball paddle",
  "pickleball tungsten tape 1 gram per inch",
] as const;

export const AUDIT_SUGGESTIONS = [
  "tungsten tape",
  "paddle weights",
  "lead alternative",
  "1 gram per inch",
  "foam core",
  "T700",
  "thermoformed",
] as const;

export const STORAGE_KEY = "amazon-researcher.keywords.v1";
export const AD_STRESS = 0.15;
