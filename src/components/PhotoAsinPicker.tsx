import { useMemo, useState } from "react";
import type { Listing } from "../types";
import { ProductThumb } from "./ProductThumb";

interface Props {
  listings: Listing[];
  value: string;
  onChange: (asin: string) => void;
  label?: string;
}

export function PhotoAsinPicker({ listings, value, onChange, label }: Props) {
  const [query, setQuery] = useState("");
  const hits = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? listings.filter(
          (row) =>
            row.asin.toLowerCase().includes(q) ||
            row.title.toLowerCase().includes(q) ||
            (row.brand ?? "").toLowerCase().includes(q),
        )
      : listings;
    return filtered.slice(0, 40);
  }, [listings, query]);
  const selected = listings.find((row) => row.asin === value);

  return (
    <div className="photo-picker">
      {label && <div className="kpi-label">{label}</div>}
      {selected && (
        <div className="card product-card" style={{ cursor: "default", marginBottom: 8 }}>
          <ProductThumb listing={selected} size="hero" />
          <div>
            <p className="asin">{selected.asin}</p>
            <p className="product-title">{selected.title}</p>
            <p className="muted">{selected.brand ?? "—"}</p>
          </div>
        </div>
      )}
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Filter catalog by ASIN / title / brand"
        aria-label="Filter catalog ASINs"
      />
      <div className="photo-picker-list" role="listbox" aria-label="Catalog ASINs">
        {hits.map((row) => (
          <button
            key={row.asin}
            type="button"
            role="option"
            aria-selected={row.asin === value}
            className={`photo-picker-hit ${row.asin === value ? "active" : ""}`}
            onClick={() => onChange(row.asin)}
          >
            <ProductThumb listing={row} />
            <div>
              <strong>{row.title}</strong>
              <div className="muted">
                {row.asin} · {row.brand ?? "—"}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
