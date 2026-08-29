import { Kpi } from "../components/Kpi";
import { ProductThumb } from "../components/ProductThumb";
import { formatMoney, formatNumber, formatRating, formatUnits } from "../lib/format";
import { titleHasPhrase } from "../lib/tokens";
import { SEED_KEYWORDS, TAPE_CATEGORIES, type Catalog, type Listing } from "../types";

interface Props {
  catalog: Catalog;
  onOpen: (listing: Listing) => void;
}

export function Mine({ catalog, onOpen }: Props) {
  const mine = catalog.listings.filter((row) => row.mine);
  const pool = catalog.meta.parentPools[0];
  const tapePeers = catalog.listings
    .filter((row) => TAPE_CATEGORIES.includes(row.category as (typeof TAPE_CATEGORIES)[number]) && !row.mine)
    .sort((a, b) => (b.units ?? -1) - (a.units ?? -1));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>My listings</h1>
          <p className="lede">
            Roore HQ. Four live SKUs from the {catalog.meta.source}. The Gen 4 paddle stays here even though paddles
            are excluded from research profit plays.
          </p>
        </div>
      </div>

      <div className="kpis">
        <Kpi label="Roore SKUs" value={mine.length} sub="exactly these four ASINs" />
        <Kpi label="Catalog reviews" value={formatNumber(catalog.meta.catalogReviews)} sub="weighted 4.31" />
        <Kpi label="Weighted rating" value={catalog.meta.weightedRating.toFixed(2)} />
        <Kpi label="Parent pool" value={pool?.reviews ?? "—"} sub="B0DJ5M2MMW + B0GJTZW6L2" />
      </div>
      <p className="note">{pool?.note}</p>

      <div className="stack" style={{ marginTop: 16 }}>
        {mine.map((listing) => (
          <article key={listing.asin} className="card listing-block">
            <button className="product-card" onClick={() => onOpen(listing)}>
              <ProductThumb listing={listing} size="hero" />
              <div>
                <p className="asin">{listing.asin}</p>
                <h2 className="product-title">{listing.title}</h2>
                <p className="muted">
                  {formatMoney(listing.price)}
                  {listing.listPrice ? ` list ${formatMoney(listing.listPrice)}` : ""}
                  {" · "}
                  {formatRating(listing)}
                  {" · "}
                  {formatUnits(listing)}
                  {" · "}
                  {listing.category?.replaceAll("_", " ")}
                </p>
              </div>
            </button>
            <div>
              <h3 className="mini-title">Seed keyword coverage</h3>
              <p className="muted">Title-token match only. Ranks stay not checked.</p>
              <div className="badge-row">
                {SEED_KEYWORDS.map((phrase) => {
                  const on = titleHasPhrase(listing.title, phrase);
                  return (
                    <span key={phrase} className={`badge ${on ? "ok" : "miss"}`}>
                      {on ? "IN TITLE" : "MISSING"} · {phrase}
                    </span>
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </div>

      <section className="section">
        <h2 className="section-title">Tape category context</h2>
        <p className="lede">
          Catalog peers in tungsten_tape and lead_tape. Price / units / reviews only — no invented competitors.
        </p>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Units</th>
                <th>Reviews</th>
              </tr>
            </thead>
            <tbody>
              {tapePeers.map((row) => (
                <tr key={row.asin} onClick={() => onOpen(row)}>
                  <td>
                    <div className="product-cell">
                      <ProductThumb listing={row} />
                      <div>
                        <div className="product-title">{row.title}</div>
                        <div className="asin">{row.asin}</div>
                      </div>
                    </div>
                  </td>
                  <td>{row.category?.replaceAll("_", " ")}</td>
                  <td className="num">{formatMoney(row.price)}</td>
                  <td className="num">{formatUnits(row)}</td>
                  <td className="num">{formatNumber(row.reviews)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
