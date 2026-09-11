import type { SearchTermRow } from "../types";

const HEADER_ALIASES: Record<string, keyof Pick<
  SearchTermRow,
  | "searchTerm"
  | "impressions"
  | "clicks"
  | "spend"
  | "sales"
  | "orders"
  | "acosPct"
  | "cvr"
  | "campaignName"
  | "matchType"
  | "advertisedAsin"
>> = {
  customersearchterm: "searchTerm",
  searchterm: "searchTerm",
  customersearchterms: "searchTerm",
  impressions: "impressions",
  clicks: "clicks",
  spend: "spend",
  spendusd: "spend",
  cost: "spend",
  sales: "sales",
  sevendaytotalsales: "sales",
  "7daytotalsales": "sales",
  fourteendaytotalsales: "sales",
  "14daytotalsales": "sales",
  totalsales: "sales",
  sevendaytotalsalesusd: "sales",
  orders: "orders",
  sevendaytotalorders: "orders",
  "7daytotalorders": "orders",
  fourteendaytotalorders: "orders",
  "14daytotalorders": "orders",
  totalorders: "orders",
  acos: "acosPct",
  totaladvertisingcostofsalesacos: "acosPct",
  totaladvertisingcostofsales: "acosPct",
  advertisingcostofsales: "acosPct",
  cvr: "cvr",
  conversionrate: "cvr",
  sevendayconversionrate: "cvr",
  "7dayconversionrate": "cvr",
  fourteendayconversionrate: "cvr",
  campaignname: "campaignName",
  campaign: "campaignName",
  matchtype: "matchType",
  targeting: "matchType",
  advertisedasin: "advertisedAsin",
  asin: "advertisedAsin",
};

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

function detectDelimiter(line: string): string {
  const commas = (line.match(/,/g) ?? []).length;
  const semis = (line.match(/;/g) ?? []).length;
  const tabs = (line.match(/\t/g) ?? []).length;
  if (tabs > commas && tabs > semis) return "\t";
  if (semis > commas) return ";";
  return ",";
}

export function parseCsv(text: string, delimiter: string): string[][] {
  const input = text.replace(/^\uFEFF/, "");
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let i = 0;
  let inQuotes = false;

  while (i < input.length) {
    const c = input[i];
    if (inQuotes) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i += 1;
      continue;
    }
    if (c === delimiter) {
      row.push(field.trim());
      field = "";
      i += 1;
      continue;
    }
    if (c === "\n" || c === "\r") {
      if (c === "\r" && input[i + 1] === "\n") i += 1;
      row.push(field.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      row = [];
      field = "";
      i += 1;
      continue;
    }
    field += c;
    i += 1;
  }
  row.push(field.trim());
  if (row.some((cell) => cell !== "")) rows.push(row);
  return rows;
}

function parseNumber(raw: string | undefined): number | null {
  if (raw == null || raw === "") return null;
  const cleaned = raw.replace(/[$€£,\s]/g, "").replace(/[()]/g, "");
  if (!cleaned || cleaned === "-" || cleaned === "—" || /^n\/?a$/i.test(cleaned)) return null;
  const n = Number(cleaned.replace(/%$/, ""));
  return Number.isFinite(n) ? n : null;
}

function parsePct(raw: string | undefined): number | null {
  if (raw == null || raw === "") return null;
  const hadPct = raw.includes("%");
  const n = parseNumber(raw);
  if (n == null) return null;
  if (hadPct) return n;
  if (n > 1) return n;
  return n * 100;
}

function looksLikeHeader(cells: string[]): boolean {
  const keys = new Set(cells.map(normalizeHeader));
  const hasTerm = keys.has("customersearchterm") || keys.has("searchterm");
  const hasMetric =
    keys.has("impressions") ||
    keys.has("clicks") ||
    keys.has("spend") ||
    keys.has("campaignname");
  return hasTerm && hasMetric;
}

function slugId(parts: Array<string | null | undefined>, index: number): string {
  const slug = parts
    .map((part) => (part ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""))
    .filter(Boolean)
    .join("--")
    .slice(0, 80);
  return `st-${index}-${slug || "row"}`;
}

function detectReportDelimiter(text: string): string {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/);
  for (const line of lines) {
    if (!line.trim()) continue;
    const delimiter = detectDelimiter(line);
    const cells = parseCsv(line, delimiter)[0] ?? [];
    if (looksLikeHeader(cells)) return delimiter;
  }
  return detectDelimiter(lines.find((line) => line.trim()) ?? ",");
}

export function parseSearchTermReport(text: string): SearchTermRow[] {
  const delimiter = detectReportDelimiter(text);
  const table = parseCsv(text, delimiter);
  const headerIndex = table.findIndex(looksLikeHeader);
  if (headerIndex < 0) {
    throw new Error(
      "Could not find a Search Term Report header row (need Customer Search Term / Search Term plus metrics).",
    );
  }
  const headers = table[headerIndex].map(normalizeHeader);
  const fields = headers.map((header) => HEADER_ALIASES[header] ?? null);
  const rows: SearchTermRow[] = [];

  for (let i = headerIndex + 1; i < table.length; i += 1) {
    const cells = table[i];
    const raw: Partial<SearchTermRow> = {};
    fields.forEach((field, col) => {
      if (!field) return;
      const value = cells[col] ?? "";
      if (field === "searchTerm") raw.searchTerm = value || undefined;
      else if (field === "campaignName") raw.campaignName = value || null;
      else if (field === "matchType") raw.matchType = value || null;
      else if (field === "advertisedAsin") raw.advertisedAsin = value || null;
      else if (field === "acosPct") raw.acosPct = parsePct(value);
      else if (field === "cvr") raw.cvr = parsePct(value);
      else if (field === "impressions") raw.impressions = parseNumber(value);
      else if (field === "clicks") raw.clicks = parseNumber(value);
      else if (field === "spend") raw.spend = parseNumber(value);
      else if (field === "sales") raw.sales = parseNumber(value);
      else if (field === "orders") raw.orders = parseNumber(value);
    });
    const searchTerm = (raw.searchTerm ?? "").trim();
    if (!searchTerm) continue;
    const clicks = raw.clicks ?? null;
    const orders = raw.orders ?? null;
    let cvr = raw.cvr ?? null;
    if (cvr == null && clicks != null && clicks > 0 && orders != null) {
      cvr = (orders / clicks) * 100;
    }
    let acosPct = raw.acosPct ?? null;
    if (acosPct == null && raw.spend != null && raw.sales != null && raw.sales > 0) {
      acosPct = (raw.spend / raw.sales) * 100;
    }
    rows.push({
      id: slugId([searchTerm, raw.campaignName, raw.matchType], rows.length),
      searchTerm,
      impressions: raw.impressions ?? null,
      clicks,
      spend: raw.spend ?? null,
      sales: raw.sales ?? null,
      orders,
      acosPct,
      cvr,
      campaignName: raw.campaignName ?? null,
      matchType: raw.matchType ?? null,
      advertisedAsin: raw.advertisedAsin ?? null,
      example: false,
    });
  }

  return rows;
}

export function isAutoLike(matchType: string | null, campaignName: string | null): boolean {
  const blob = `${matchType ?? ""} ${campaignName ?? ""}`.toLowerCase();
  return /auto|close.?match|loose.?match|substitutes|complements|targeting.?expression/.test(blob);
}

export function isBroadLike(matchType: string | null, campaignName: string | null): boolean {
  const blob = `${matchType ?? ""} ${campaignName ?? ""}`.toLowerCase();
  return /\bbroad\b/.test(blob);
}
