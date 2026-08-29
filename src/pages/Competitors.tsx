import { useMemo, useState } from "react";
import { ProductThumb } from "../components/ProductThumb";
import { ProductBadges } from "../components/Badges";
import { formatMoney, formatNumber, formatUnits } from "../lib/format";
import type { Cluster } from "../hooks/useClusters";
import type { Listing } from "../types";

interface Props {
  listings: Listing[];
  clusters: Cluster[];
  addAsin: (id: Cluster["id"], asin: string) => void;
  removeAsin: (id: Cluster["id"], asin: string) => void;
  reset: () => void;
  onOpen: (listing: Listing) => void;
}

export function Competitors({ listings, clusters, addAsin, removeAsin, reset, onOpen }: Props) {
  const [active, setActive] = useState<Cluster["id"]>("tape");
  const [pick, setPick] = useState("");
  const byAsin = useMemo(() => new Map(listings.map((row) => [row.asin, row])), [listings]);
  const cluster = clusters.find((item) => item.id === active) ?? clusters[0];
  const rows = cluster.asins.map((asin) => byAsin.get(asin)).filter((row): row is Listing => Boolean(row));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Competitors</h1>
          <p className="lede">
            Two saved clusters. Add or remove ASINs from this catalog only — nothing invented.
          </p>
        </div>
        <button className="btn ghost" type="button" onClick={reset}>
          Reset clusters
        </button>
      </div>

      <div className="chip-row">
        {clusters.map((item) => (
          <button
            key={item.id}
            className={`chip ${active === item.id ? "active" : ""}`}
            onClick={() => setActive(item.id)}
          >
            {item.name} · {item.asins.length}
          </button>
        ))}
      </div>

      <form
        className="form-row"
        onSubmit={(event) => {
          event.preventDefault();
          if (listings.some((row) => row.asin === pick)) {
            addAsin(cluster.id, pick);
            setPick("");
          }
        }}
      >
        <select value={pick} onChange={(event) => setPick(event.target.value)}>
          <option value="">Add a catalog ASIN</option>
          {listings
            .filter((row) => !cluster.asins.includes(row.asin))
            .map((row) => (
              <option key={row.asin} value={row.asin}>
                {row.asin} — {row.title.slice(0, 72)}
              </option>
            ))}
        </select>
        <button className="btn" type="submit">
          Add
        </button>
      </form>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Rating</th>
              <th>Reviews</th>
              <th>Units</th>
              <th>Opp</th>
              <th>Src</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.asin} className={row.mine ? "mine-row" : undefined} onClick={() => onOpen(row)}>
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
                <td>{row.brand ?? "—"}</td>
                <td className="num">{formatMoney(row.price)}</td>
                <td className="num">{row.rating == null ? "—" : row.rating.toFixed(1)}</td>
                <td className="num">{formatNumber(row.reviews)}</td>
                <td className="num">{formatUnits(row)}</td>
                <td className="num">{formatNumber(row.opportunity, 1)}</td>
                <td>{row.sourced}</td>
                <td>
                  <button
                    className="btn danger"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      removeAsin(cluster.id, row.asin);
                    }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
