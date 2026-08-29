import { useMemo, useState } from "react";
import { ProductThumb } from "../components/ProductThumb";
import { titleHasPhrase, tokenize } from "../lib/tokens";
import { AUDIT_SUGGESTIONS, type Listing } from "../types";

interface Props {
  listings: Listing[];
  onTrack: (phrase: string) => void;
}

export function Studio({ listings, onTrack }: Props) {
  const mine = listings.filter((row) => row.mine);
  const [asin, setAsin] = useState("B0GDC2M73C");
  const listing = useMemo(
    () => mine.find((row) => row.asin === asin) ?? mine[0],
    [asin, mine],
  );

  if (!listing) return <div className="page">No Roore listings loaded.</div>;

  const titleLen = listing.title.length;
  const tokens = tokenize(listing.title);
  const extra = tokens.filter(
    (token) => !AUDIT_SUGGESTIONS.some((phrase) => phrase.toLowerCase().includes(token)),
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Studio</h1>
          <p className="lede">Listing optimizer for the four Roore SKUs. Default ASIN is B0GDC2M73C.</p>
        </div>
        <select value={listing.asin} onChange={(event) => setAsin(event.target.value)}>
          {mine.map((row) => (
            <option key={row.asin} value={row.asin}>
              {row.asin} — {row.title.slice(0, 60)}
            </option>
          ))}
        </select>
      </div>

      <div className="card product-card" style={{ cursor: "default", marginBottom: 16 }}>
        <ProductThumb listing={listing} size="hero" />
        <div>
          <p className="asin">{listing.asin}</p>
          <p className="product-title">{listing.title}</p>
          <p className="muted">{titleLen} characters in title</p>
        </div>
      </div>

      <div className="kpis">
        <Check ok={titleLen > 0} label="Title" value={`${titleLen} chars`} />
        <Check ok={Boolean(listing.image)} label="Image" value={listing.image ? "present" : "missing"} />
        <Check
          ok={listing.listPrice != null && listing.price != null && listing.listPrice > listing.price}
          label="List vs sale"
          value={
            listing.listPrice != null && listing.price != null
              ? `$${listing.price} / list $${listing.listPrice}`
              : "no list price"
          }
        />
        <Check
          ok={(listing.reviews ?? 0) > 0}
          label="Reviews"
          value={listing.reviews == null ? "—" : String(listing.reviews)}
        />
        <Check ok={Boolean(listing.unitsLabel)} label="Bought badge" value={listing.unitsLabel ?? "none"} />
      </div>

      <section className="section">
        <h2 className="section-title">In-title suggestions</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Suggestion</th>
                <th>In title</th>
                <th>Volume</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {AUDIT_SUGGESTIONS.map((phrase) => {
                const present = titleHasPhrase(listing.title, phrase);
                return (
                  <tr key={phrase}>
                    <td>
                      <strong>{phrase}</strong>{" "}
                      <span className={`badge ${present ? "ok" : "miss"}`}>{present ? "IN TITLE" : "MISSING"}</span>
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
              {extra.map((token) => (
                <tr key={token}>
                  <td>
                    <strong>{token}</strong> <span className="badge ok">IN TITLE</span>
                  </td>
                  <td>Yes</td>
                  <td className="muted">add your own later</td>
                  <td>
                    <button className="btn" type="button" onClick={() => onTrack(token)}>
                      Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Check({ ok, label, value }: { ok: boolean; label: string; value: string }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value" style={{ fontSize: "1.05rem" }}>
        {value}
      </div>
      <div className="kpi-sub">{ok ? "pass" : "gap"}</div>
    </div>
  );
}
