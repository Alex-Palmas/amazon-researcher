import { useMemo } from "react";
import { ProductCard } from "../components/ProductCard";
import { ListingTable } from "../components/ListingTable";
import {
  formatMoney,
  isTrendingNew,
  researchListings,
  survivesAdStress,
} from "../lib/catalog";
import type { Catalog, Listing } from "../types";

interface Props {
  catalog: Catalog;
  onOpen: (listing: Listing) => void;
}

export function Research({ catalog, onOpen }: Props) {
  const rows = useMemo(() => researchListings(catalog.listings), [catalog.listings]);
  const plays = rows.filter(survivesAdStress);
  const trending = rows.filter(isTrendingNew);
  const sourced = rows.filter((row) => row.sourced === "yes").length;
  const units = rows.reduce((sum, row) => sum + (row.units ?? 0), 0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Research</h1>
          <p className="lede">
            Accessory and adjacent demand. Own Roore SKUs stay on My listings and are hidden here.
          </p>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi">
          <div className="kpi-label">Public ASINs</div>
          <div className="kpi-value">{rows.length}</div>
          <div className="kpi-sub">mine:true excluded</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Recommended plays</div>
          <div className="kpi-value">{plays.length}</div>
          <div className="kpi-sub">sourced and net &gt; $0 after 15% ads</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Trending new</div>
          <div className="kpi-value">{trending.length}</div>
          <div className="kpi-sub">units ≥ 200 and reviews ≤ 80</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Sourced / units</div>
          <div className="kpi-value">{sourced}</div>
          <div className="kpi-sub">{units.toLocaleString()} listed monthly units</div>
        </div>
      </div>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Recommended plays</h2>
            <p className="lede">Survive a 15% ad load using only seeded FOB + unit. No invented fees.</p>
          </div>
        </div>
        <div className="play-grid">
          {plays.map((listing) => (
            <ProductCard
              key={listing.asin}
              listing={listing}
              onOpen={onOpen}
              extra={listing.ads != null ? `Seeded ads/mo ${formatMoney(listing.ads)}` : undefined}
            />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Trending new</h2>
            <p className="lede">units ≥ 200 and reviews ≤ 80, plus rows marked TRENDING in the scrape.</p>
          </div>
        </div>
        <div className="trend-grid">
          {trending.map((listing) => (
            <ProductCard key={listing.asin} listing={listing} onOpen={onOpen} />
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Catalog</h2>
            <p className="lede">Photo-first table. Click a row for the detail drawer.</p>
          </div>
        </div>
        <ListingTable listings={rows} onOpen={onOpen} />
      </section>
    </div>
  );
}
