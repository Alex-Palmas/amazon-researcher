import { useMemo, useState } from "react";
import { ProductThumb } from "../components/ProductThumb";
import { titleHasPhrase } from "../lib/catalog";
import { AUDIT_SUGGESTIONS, type Listing } from "../types";

interface Props {
  listings: Listing[];
  onTrack: (phrase: string) => void;
}

export function Audit({ listings, onTrack }: Props) {
  const mine = listings.filter((row) => row.mine);
  const [asin, setAsin] = useState("B0GDC2M73C");
  const listing = useMemo(
    () => mine.find((row) => row.asin === asin) ?? mine[0],
    [asin, mine],
  );

  if (!listing) {
    return <div className="page">No Roore listings loaded.</div>;
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Audit</h1>
          <p className="lede">
            Title coverage for the live Roore catalog. Default ASIN is B0GDC2M73C.
          </p>
        </div>
        <select
          value={listing.asin}
          onChange={(event) => setAsin(event.target.value)}
          aria-label="Listing to audit"
        >
          {mine.map((row) => (
            <option key={row.asin} value={row.asin}>
              {row.asin} — {row.title}
            </option>
          ))}
        </select>
      </div>

      <div className="card product-card" style={{ cursor: "default", marginBottom: 16 }}>
        <ProductThumb listing={listing} size="hero" />
        <div>
          <p className="asin">{listing.asin}</p>
          <p className="product-title">{listing.title}</p>
          <p className="muted">In-title badges use exact phrase match against this title only.</p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ cursor: "default" }}>Suggestion</th>
              <th style={{ cursor: "default" }}>In title</th>
              <th style={{ cursor: "default" }}>Volume</th>
              <th style={{ cursor: "default" }}></th>
            </tr>
          </thead>
          <tbody>
            {AUDIT_SUGGESTIONS.map((phrase) => {
              const present = titleHasPhrase(listing.title, phrase);
              return (
                <tr key={phrase}>
                  <td>
                    <strong>{phrase}</strong>{" "}
                    <span className={`badge ${present ? "ok" : "miss"}`}>
                      {present ? "IN TITLE" : "MISSING"}
                    </span>
                  </td>
                  <td>{present ? "Yes" : "No"}</td>
                  <td className="muted">add your own later</td>
                  <td>
                    <button className="btn" type="button" onClick={() => onTrack(phrase)}>
                      Track
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
