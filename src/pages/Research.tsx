import { useMemo, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { ProductThumb } from "../components/ProductThumb";
import { ProductBadges } from "../components/Badges";
import { Kpi } from "../components/Kpi";
import {
  categoriesOf,
  chartListings,
  compareValues,
  defaultChartSort,
  hasChartFields,
  isRecommendedPlay,
  researchListings,
} from "../lib/catalog";
import { formatMoney, formatNumber, formatUnits, pnlClass } from "../lib/format";
import type { Catalog, ChartView, Listing, Sourced } from "../types";

type SortKey =
  | "title"
  | "opportunity"
  | "rank"
  | "bestsellerRank"
  | "newReleaseRank"
  | "price"
  | "rating"
  | "reviews"
  | "units"
  | "monthlyRevenue"
  | "fob"
  | "unit"
  | "afterAdsMonthly"
  | "alibaba";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "title", label: "Product" },
  { key: "opportunity", label: "Opp" },
  { key: "rank", label: "Pop. rank" },
  { key: "bestsellerRank", label: "BS rank" },
  { key: "newReleaseRank", label: "NR rank" },
  { key: "price", label: "Price" },
  { key: "rating", label: "Rating" },
  { key: "reviews", label: "Reviews" },
  { key: "units", label: "Units" },
  { key: "monthlyRevenue", label: "Rev / mo" },
  { key: "fob", label: "FOB" },
  { key: "unit", label: "Unit" },
  { key: "afterAdsMonthly", label: "After ads" },
  { key: "alibaba", label: "Alibaba" },
];

const CHART_CHIPS: { id: ChartView; label: string }[] = [
  { id: "accessories", label: "Accessories" },
  { id: "bestsellers", label: "Best Sellers" },
  { id: "newReleases", label: "New Releases" },
  { id: "all", label: "All" },
];

interface Props {
  catalog: Catalog;
  onOpen: (listing: Listing) => void;
}

export function Research({ catalog, onOpen }: Props) {
  const playsBase = useMemo(() => researchListings(catalog.listings), [catalog.listings]);
  const [chart, setChart] = useState<ChartView>("accessories");
  const base = useMemo(() => chartListings(catalog.listings, chart), [catalog.listings, chart]);
  const cats = useMemo(() => categoriesOf(base), [base]);
  const [query, setQuery] = useState("");
  const [sourced, setSourced] = useState<"all" | Sourced>("all");
  const [category, setCategory] = useState("all");
  const [hideLocked, setHideLocked] = useState(false);
  const [hideExcluded, setHideExcluded] = useState(true);
  const initialSort = defaultChartSort("accessories");
  const [sortKey, setSortKey] = useState<SortKey>(initialSort.key);
  const [dir, setDir] = useState<"asc" | "desc">(initialSort.dir);
  const chartsReady = hasChartFields(catalog.listings);
  const rankingView = chart === "bestsellers" || chart === "newReleases";
  const chipCounts = useMemo(
    () => ({
      accessories: chartListings(catalog.listings, "accessories").length,
      bestsellers: chartListings(catalog.listings, "bestsellers").length,
      newReleases: chartListings(catalog.listings, "newReleases").length,
      all: chartListings(catalog.listings, "all").length,
    }),
    [catalog.listings],
  );

  const plays = playsBase.filter(isRecommendedPlay);
  const trending = playsBase.filter((row) => row.trending);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = base.filter((row) => {
      if (sourced !== "all" && row.sourced !== sourced) return false;
      if (category !== "all" && row.category !== category) return false;
      if (hideLocked && row.sourced === "no") return false;
      if (hideExcluded && !rankingView && row.profitExcluded) return false;
      if (
        q &&
        !row.asin.toLowerCase().includes(q) &&
        !row.title.toLowerCase().includes(q) &&
        !(row.brand ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
    filtered.sort((a, b) => {
      const cmp = compareValues(a[sortKey], b[sortKey]);
      return dir === "asc" ? cmp : -cmp;
    });
    return filtered;
  }, [base, query, sourced, category, hideLocked, hideExcluded, rankingView, sortKey, dir]);

  const onChart = (view: ChartView) => {
    setChart(view);
    setCategory("all");
    const next = defaultChartSort(view);
    setSortKey(next.key);
    setDir(next.dir);
  };

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setDir(key === "title" || key === "rank" || key === "bestsellerRank" || key === "newReleaseRank" ? "asc" : "desc");
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Research</h1>
          <p className="lede">
            Opportunity finder. Accessories is the 10-page popularity catalog. Best Sellers and New Releases are
            Pickleball Accessories charts (node 213609101011), sorted by those chart ranks.
          </p>
        </div>
      </div>

      <div className="kpis">
        <Kpi label="Research rows" value={catalog.meta.researchCount} sub="mine:true hidden" />
        <Kpi label="Recommended plays" value={plays.length} sub="sourced · after ads > $0" />
        <Kpi label="Trending new" value={catalog.meta.trendingCount} sub="units ≥ 200 · reviews ≤ 80" />
        <Kpi label="Sourced" value={catalog.meta.sourcedCount} sub="FOB stack in scrape" />
      </div>

      <section className="section">
        <h2 className="section-title">Recommended plays</h2>
        <p className="lede">Sourced and leftover after 15% TACOS. Paddle sets and covers stay out of this rail.</p>
        <div className="play-grid">
          {plays.map((listing) => (
            <ProductCard key={listing.asin} listing={listing} onOpen={onOpen} />
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Trending new</h2>
        <div className="play-grid">
          {trending.map((listing) => (
            <ProductCard key={listing.asin} listing={listing} onOpen={onOpen} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Catalog</h2>
            <p className="lede">Photo-first. Opportunity is the precomputed scrape score — not a new sales estimate.</p>
          </div>
        </div>
        <div className="chip-row">
          {CHART_CHIPS.map((chip) => (
            <button
              key={chip.id}
              className={`chip ${chart === chip.id ? "active" : ""}`}
              onClick={() => onChart(chip.id)}
            >
              {chip.label} · {chipCounts[chip.id]}
            </button>
          ))}
        </div>
        {!chartsReady && (
          <p className="note">
            Best Sellers and New Releases are empty until the chart scrape lands. No ASINs invented.
          </p>
        )}
        <div className="chip-row">
          <button className={`chip ${category === "all" ? "active" : ""}`} onClick={() => setCategory("all")}>
            all
          </button>
          {cats.map((cat) => (
            <button
              key={cat}
              className={`chip ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat.replaceAll("_", " ")}
            </button>
          ))}
        </div>
        <div className="form-row">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search ASIN / title / brand"
          />
          <select value={sourced} onChange={(event) => setSourced(event.target.value as "all" | Sourced)}>
            <option value="all">All sourced</option>
            <option value="yes">Sourced</option>
            <option value="no">Brand-locked</option>
            <option value="unknown">Unknown</option>
          </select>
          <label className="check">
            <input
              type="checkbox"
              checked={hideLocked}
              onChange={(event) => setHideLocked(event.target.checked)}
            />
            Hide brand-locked
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={hideExcluded}
              onChange={(event) => setHideExcluded(event.target.checked)}
              disabled={rankingView}
            />
            Hide profit-excluded
          </label>
        </div>
        {rankingView && (
          <p className="note">
            Paddle sets stay profit-excluded from plays, but they appear on Best Sellers and New Releases ranking views.
          </p>
        )}
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                {COLUMNS.map((col) => (
                  <th key={col.key} onClick={() => onSort(col.key)}>
                    {col.label}
                    {sortKey === col.key ? (dir === "asc" ? " ↑" : " ↓") : ""}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={COLUMNS.length}>
                    {chart === "bestsellers" || chart === "newReleases"
                      ? "No rows on this chart yet. Waiting on the scrape — no ASINs invented."
                      : "No rows match these filters."}
                  </td>
                </tr>
              )}
              {rows.map((row) => (
                <tr key={row.asin} onClick={() => onOpen(row)}>
                  <td>
                    <div className="product-cell">
                      <ProductThumb listing={row} />
                      <div>
                        <div className="product-title">{row.title}</div>
                        <div className="asin">{row.asin}</div>
                        <ProductBadges listing={row} />
                      </div>
                    </div>
                  </td>
                  <td className="num">{formatNumber(row.opportunity, 1)}</td>
                  <td className="num">{formatNumber(row.rank)}</td>
                  <td className="num">{formatNumber(row.bestsellerRank)}</td>
                  <td className="num">{formatNumber(row.newReleaseRank)}</td>
                  <td className="num">{formatMoney(row.price)}</td>
                  <td className="num">{row.rating == null ? "—" : row.rating.toFixed(1)}</td>
                  <td className="num">{formatNumber(row.reviews)}</td>
                  <td className="num">{formatUnits(row)}</td>
                  <td className="num">{formatMoney(row.monthlyRevenue)}</td>
                  <td className="num">{formatMoney(row.fob)}</td>
                  <td className={`num ${pnlClass(row.unit)}`}>{formatMoney(row.unit)}</td>
                  <td className={`num ${pnlClass(row.afterAdsMonthly)}`}>{formatMoney(row.afterAdsMonthly)}</td>
                  <td>
                    <div className="clamp" title={row.alibaba ?? undefined}>
                      {row.alibaba ?? "—"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="note" style={{ marginTop: 12 }}>
          Monthly profit = 100% of that listing&apos;s bought-past-month units, not a forecast; 15% referral + 2026 FBA
          + 3.5% fuel; bag duty ~42.6%; balls ~12.9%; other sports ~11.5%; no reciprocal overlay; after ads = minus 15%
          TACOS.
        </p>
      </section>
    </div>
  );
}
