import { useMemo, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { ProductThumb } from "../components/ProductThumb";
import { ProductBadges } from "../components/Badges";
import { Kpi } from "../components/Kpi";
import { categoriesOf, compareValues, isRecommendedPlay, researchListings } from "../lib/catalog";
import { formatMoney, formatNumber, formatUnits, pnlClass } from "../lib/format";
import type { Catalog, Listing, Sourced } from "../types";

type SortKey =
  | "title"
  | "opportunity"
  | "rank"
  | "price"
  | "rating"
  | "reviews"
  | "units"
  | "monthlyRevenue"
  | "fob"
  | "unit"
  | "afterAdsMonthly";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "title", label: "Product" },
  { key: "opportunity", label: "Opp" },
  { key: "rank", label: "Rank" },
  { key: "price", label: "Price" },
  { key: "rating", label: "Rating" },
  { key: "reviews", label: "Reviews" },
  { key: "units", label: "Units" },
  { key: "monthlyRevenue", label: "Rev / mo" },
  { key: "fob", label: "FOB" },
  { key: "unit", label: "Unit" },
  { key: "afterAdsMonthly", label: "After ads" },
];

interface Props {
  catalog: Catalog;
  onOpen: (listing: Listing) => void;
}

export function Research({ catalog, onOpen }: Props) {
  const base = useMemo(() => researchListings(catalog.listings), [catalog.listings]);
  const cats = useMemo(() => categoriesOf(base), [base]);
  const [query, setQuery] = useState("");
  const [sourced, setSourced] = useState<"all" | Sourced>("all");
  const [category, setCategory] = useState("all");
  const [hideLocked, setHideLocked] = useState(false);
  const [hideExcluded, setHideExcluded] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("afterAdsMonthly");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const plays = base.filter(isRecommendedPlay);
  const trending = base.filter((row) => row.trending);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = base.filter((row) => {
      if (sourced !== "all" && row.sourced !== sourced) return false;
      if (category !== "all" && row.category !== category) return false;
      if (hideLocked && row.sourced === "no") return false;
      if (hideExcluded && row.profitExcluded) return false;
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
  }, [base, query, sourced, category, hideLocked, hideExcluded, sortKey, dir]);

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setDir(key === "title" ? "asc" : "desc");
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Research</h1>
          <p className="lede">
            Opportunity finder on the {catalog.meta.researchCount}-row accessories set. Mine SKUs stay on My listings.
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
            />
            Hide profit-excluded
          </label>
        </div>
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
                  <td className="num">{formatMoney(row.price)}</td>
                  <td className="num">{row.rating == null ? "—" : row.rating.toFixed(1)}</td>
                  <td className="num">{formatNumber(row.reviews)}</td>
                  <td className="num">{formatUnits(row)}</td>
                  <td className="num">{formatMoney(row.monthlyRevenue)}</td>
                  <td className="num">{formatMoney(row.fob)}</td>
                  <td className={`num ${pnlClass(row.unit)}`}>{formatMoney(row.unit)}</td>
                  <td className={`num ${pnlClass(row.afterAdsMonthly)}`}>{formatMoney(row.afterAdsMonthly)}</td>
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
