import { ProductCard } from "../components/ProductCard";
import { formatNumber } from "../lib/catalog";
import type { Catalog, Listing } from "../types";

interface Props {
  catalog: Catalog;
  onOpen: (listing: Listing) => void;
}

export function Mine({ catalog, onOpen }: Props) {
  const mine = catalog.listings.filter((row) => row.mine);
  const pool = catalog.meta.parentPools[0];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>My listings</h1>
          <p className="lede">
            Four Roore SKUs from the {catalog.meta.source}. Do not treat sibling variants as extra ASINs.
          </p>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi">
          <div className="kpi-label">Roore SKUs</div>
          <div className="kpi-value">{mine.length}</div>
          <div className="kpi-sub">B0GDC2M73C · B0H696X4G4 · B0DJ5M2MMW · B0GJTZW6L2</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Catalog reviews</div>
          <div className="kpi-value">{formatNumber(catalog.meta.catalogReviews)}</div>
          <div className="kpi-sub">sum of listing review counts</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Weighted rating</div>
          <div className="kpi-value">{catalog.meta.weightedRating.toFixed(2)}</div>
          <div className="kpi-sub">weighted by those review counts</div>
        </div>
        <div className="kpi">
          <div className="kpi-label">Parent pool</div>
          <div className="kpi-value">{pool?.reviews ?? "—"}</div>
          <div className="kpi-sub">shared by the two 1g/in tapes</div>
        </div>
      </div>

      <p className="note">
        {pool?.note} Catalog reviews stay {catalog.meta.catalogReviews} with weighted rating{" "}
        {catalog.meta.weightedRating.toFixed(2)}.
      </p>

      <section className="section" style={{ marginTop: 18 }}>
        <div className="mine-grid">
          {mine.map((listing) => (
            <ProductCard key={listing.asin} listing={listing} onOpen={onOpen} />
          ))}
        </div>
      </section>
    </div>
  );
}
