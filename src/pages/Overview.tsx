import { bestPlay, findAsin, isRecommendedPlay } from "../lib/catalog";
import { formatMoney, formatNumber } from "../lib/format";
import { Kpi } from "../components/Kpi";
import { ProductCard } from "../components/ProductCard";
import type { Catalog, Listing } from "../types";

interface Props {
  catalog: Catalog;
  onOpen: (listing: Listing) => void;
}

export function Overview({ catalog, onOpen }: Props) {
  const { meta, listings } = catalog;
  const trending = listings.filter((row) => row.trending);
  const best = bestPlay(listings);
  const strips = findAsin(listings, "B0GDC2M73C");
  const plays = listings.filter(isRecommendedPlay);
  const maxUnits = Math.max(...trending.map((row) => row.units ?? 0), 1);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Overview</h1>
          <p className="lede">
            Roore command center. Scrape stamp {meta.scrapedAt} {meta.timezone} · {meta.source}.
          </p>
        </div>
      </div>

      <h2 className="section-title">Roore HQ</h2>
      <div className="kpis">
        <Kpi label="Roore SKUs" value={4} sub="B0GDC2M73C · B0H696X4G4 · B0DJ5M2MMW · B0GJTZW6L2" />
        <Kpi label="Catalog reviews" value={formatNumber(meta.catalogReviews)} sub="sum of listing review counts" />
        <Kpi label="Weighted rating" value={meta.weightedRating.toFixed(2)} sub="weighted by those counts" />
        <Kpi
          label="Parent pool"
          value={meta.parentPools[0]?.reviews ?? "—"}
          sub="shared by the two 1g/in tapes"
        />
      </div>
      <p className="note">{meta.parentPools[0]?.note}</p>

      <h2 className="section-title" style={{ marginTop: 22 }}>
        Research scrape
      </h2>
      <div className="kpis">
        <Kpi label="Accessories + Roore" value={meta.listingCount} sub={`${meta.researchCount} after hiding mine`} />
        <Kpi label="Sourced" value={meta.sourcedCount} sub="FOB stack present" />
        <Kpi label="Trending new" value={meta.trendingCount} sub="units ≥ 200 and reviews ≤ 80" />
        <Kpi label="Plays after 15% TACOS" value={plays.length} sub="sourced · not excluded · leftover > $0" />
      </div>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Alert rail</h2>
            <p className="lede">This-week snapshot only — no invented history.</p>
          </div>
        </div>
        <div className="alert-rail">
          {strips && (
            <button className="card alert-card" onClick={() => onOpen(strips)}>
              <strong>Roore in the accessories catalog</strong>
              <p>
                {strips.asin} tungsten strips · FOB {formatMoney(strips.fob)} · unit {formatMoney(strips.unit)} ·
                after ads {formatMoney(strips.afterAdsMonthly)}
              </p>
            </button>
          )}
          {best && (
            <button className="card alert-card" onClick={() => onOpen(best)}>
              <strong>BEST play</strong>
              <p>
                {best.title} · after ads {formatMoney(best.afterAdsMonthly)} · opp {formatNumber(best.opportunity, 1)}
              </p>
            </button>
          )}
          {trending.map((row) => (
            <button key={row.asin} className="card alert-card" onClick={() => onOpen(row)}>
              <strong>Trending · {row.asin}</strong>
              <p>
                {row.title} · {formatNumber(row.units)} units · {formatNumber(row.reviews)} reviews
              </p>
              <div className="spark" aria-hidden>
                <span style={{ width: `${((row.units ?? 0) / maxUnits) * 100}%` }} />
              </div>
              <span className="muted">this-week snapshot</span>
            </button>
          ))}
        </div>
      </section>

      {best && (
        <section className="section">
          <h2 className="section-title">BEST this scrape</h2>
          <div className="play-grid">
            <ProductCard listing={best} onOpen={onOpen} />
          </div>
        </section>
      )}
    </div>
  );
}
