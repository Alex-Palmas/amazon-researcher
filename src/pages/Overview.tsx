import { bestPlay, chartCounts, findAsin, hasChartFields, isRecommendedPlay, newReleaseRail } from "../lib/catalog";
import { formatMoney, formatNumber } from "../lib/format";
import { AlertCard } from "../components/AlertCard";
import { Kpi } from "../components/Kpi";
import { ProductCard } from "../components/ProductCard";
import {
  ACCESSORIES_CHART_NODE,
  BESTSELLERS_CHART_URL,
  NEW_RELEASES_CHART_URL,
  type AlertsFile,
  type Catalog,
  type Listing,
} from "../types";

interface Props {
  catalog: Catalog;
  alerts: AlertsFile | null;
  alertsReady: boolean;
  onOpen: (listing: Listing) => void;
}

export function Overview({ catalog, alerts, alertsReady, onOpen }: Props) {
  const { meta, listings } = catalog;
  const trending = listings.filter((row) => row.trending);
  const best = bestPlay(listings);
  const strips = findAsin(listings, "B0GDC2M73C");
  const plays = listings.filter(isRecommendedPlay);
  const maxUnits = Math.max(...trending.map((row) => row.units ?? 0), 1);
  const lists = chartCounts(listings);
  const chartsReady = hasChartFields(listings);
  const releases = newReleaseRail(listings);
  const byAsin = new Map(listings.map((row) => [row.asin, row]));
  const weekAlerts = alerts?.alerts ?? [];

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

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Alerts</h2>
            <p className="lede">
              Photo-first when the ASIN is in listings.json. Color is severity. Week-over-week from alerts.json — no
              invented ranks.
            </p>
          </div>
        </div>
        {!alertsReady ? (
          <p className="note">Loading alerts…</p>
        ) : !alerts ? (
          <p className="note">alerts.json is missing. Nothing invented.</p>
        ) : (
          <div className="alert-rail">
            {weekAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                listing={alert.asin ? byAsin.get(alert.asin) ?? null : null}
                onOpen={onOpen}
              />
            ))}
          </div>
        )}
      </section>

      <h2 className="section-title" style={{ marginTop: 22 }}>
        Research scrape
      </h2>
      <div className="kpis">
        <Kpi
          label="Catalog rows"
          value={meta.listingCount}
          sub={`${meta.researchCount} after hiding mine · accessories + chart ASINs`}
        />
        <Kpi label="Sourced" value={meta.sourcedCount} sub="FOB stack present" />
        <Kpi label="Trending new" value={meta.trendingCount} sub="units ≥ 200 and reviews ≤ 80" />
        <Kpi label="Plays after 15% TACOS" value={plays.length} sub="sourced · not excluded · leftover > $0" />
      </div>

      <h2 className="section-title" style={{ marginTop: 22 }}>
        Amazon charts
      </h2>
      <div className="kpis">
        <Kpi label="Accessories" value={lists.accessories} sub="10-page popularity catalog" />
        <Kpi
          label="Best Sellers"
          value={lists.bestsellers}
          sub={`Pickleball Accessories · node ${ACCESSORIES_CHART_NODE}`}
        />
        <Kpi
          label="New Releases"
          value={lists.newReleases}
          sub={`Pickleball Accessories · node ${ACCESSORIES_CHART_NODE}`}
        />
      </div>
      <p className="note">
        Charts are Pickleball Accessories (node {ACCESSORIES_CHART_NODE}), not Equipment.{" "}
        <a href={BESTSELLERS_CHART_URL} target="_blank" rel="noreferrer">
          Best Sellers
        </a>
        {" · "}
        <a href={NEW_RELEASES_CHART_URL} target="_blank" rel="noreferrer">
          New Releases
        </a>
        . No equipment list.
      </p>
      {!chartsReady && (
        <p className="note">
          Best Seller and New Release counts stay 0 until the chart scrape lands. No ASINs invented.
        </p>
      )}

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">New Releases</h2>
            <p className="lede">Photo-first rail sorted by New Releases chart rank.</p>
          </div>
        </div>
        {releases.length === 0 ? (
          <p className="note">Empty until the New Releases scrape lands.</p>
        ) : (
          <div className="play-grid">
            {releases.map((listing) => (
              <ProductCard
                key={listing.asin}
                listing={listing}
                onOpen={onOpen}
                layout="photo"
                extra={
                  listing.newReleaseRank != null ? `New release #${listing.newReleaseRank}` : undefined
                }
              />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">This-week snapshot</h2>
            <p className="lede">Catalog highlights from listings.json — not week-over-week history.</p>
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
