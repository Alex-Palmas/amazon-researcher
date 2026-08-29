import { useEffect, useMemo, useState } from "react";
import { searchListings } from "../lib/catalog";
import type { Listing } from "../types";
import { ProductThumb } from "./ProductThumb";

interface Props {
  listings: Listing[];
  onOpen: (listing: Listing) => void;
}

export function CommandPalette({ listings, onOpen }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hits = useMemo(() => searchListings(listings, query), [listings, query]);

  if (!open) {
    return (
      <button className="palette-launch" type="button" onClick={() => setOpen(true)}>
        Search ASIN / title / brand
        <kbd>⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="palette-wrap">
      <button className="drawer-backdrop" aria-label="Close search" onClick={() => setOpen(false)} />
      <div className="palette" role="dialog" aria-label="Catalog search">
        <input
          autoFocus
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="ASIN, title, or brand"
        />
        <div className="palette-list">
          {hits.map((listing) => (
            <button
              key={listing.asin}
              className="palette-hit"
              type="button"
              onClick={() => {
                onOpen(listing);
                setOpen(false);
                setQuery("");
              }}
            >
              <ProductThumb listing={listing} />
              <div>
                <strong>{listing.title}</strong>
                <div className="muted">
                  {listing.asin} · {listing.brand ?? "—"}
                </div>
              </div>
            </button>
          ))}
          {query && hits.length === 0 && <p className="muted">No catalog match.</p>}
        </div>
      </div>
    </div>
  );
}
