import { ProductThumb } from "../components/ProductThumb";
import { ProductBadges } from "../components/Badges";
import { formatMoney, formatNumber, formatUnits } from "../lib/format";
import type { WatchItem } from "../hooks/useWatchlist";
import type { Listing } from "../types";

interface Props {
  listings: Listing[];
  items: WatchItem[];
  pin: (asin: string) => void;
  unpin: (asin: string) => void;
  setNotes: (asin: string, notes: string) => void;
  onOpen: (listing: Listing) => void;
}

export function Track({ listings, items, pin, unpin, setNotes, onOpen }: Props) {
  const byAsin = new Map(listings.map((row) => [row.asin, row]));
  const pinned = new Set(items.map((item) => item.asin));

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Track</h1>
          <p className="lede">
            Watchlist lives in localStorage. Fields come from listings.json — not a second invented dataset.
          </p>
        </div>
      </div>

      <div className="form-row">
        <select
          defaultValue=""
          onChange={(event) => {
            if (event.target.value) pin(event.target.value);
            event.target.value = "";
          }}
        >
          <option value="">Pin a catalog ASIN</option>
          {listings
            .filter((row) => !pinned.has(row.asin))
            .map((row) => (
              <option key={row.asin} value={row.asin}>
                {row.asin} — {row.title.slice(0, 70)}
              </option>
            ))}
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Units</th>
              <th>After ads</th>
              <th>Opp</th>
              <th>Notes</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const listing = byAsin.get(item.asin);
              if (!listing) {
                return (
                  <tr key={item.asin}>
                    <td>{item.asin} not in this scrape</td>
                    <td colSpan={6}>
                      <button className="btn danger" type="button" onClick={() => unpin(item.asin)}>
                        Unpin
                      </button>
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={item.asin} onClick={() => onOpen(listing)}>
                  <td>
                    <div className="product-cell">
                      <ProductThumb listing={listing} />
                      <div>
                        <div className="product-title">{listing.title}</div>
                        <div className="asin">{listing.asin}</div>
                        <ProductBadges listing={listing} />
                      </div>
                    </div>
                  </td>
                  <td className="num">{formatMoney(listing.price)}</td>
                  <td className="num">{formatUnits(listing)}</td>
                  <td className="num">{formatMoney(listing.afterAdsMonthly)}</td>
                  <td className="num">{formatNumber(listing.opportunity, 1)}</td>
                  <td>
                    <input
                      value={item.notes}
                      placeholder="Notes"
                      onClick={(event) => event.stopPropagation()}
                      onChange={(event) => setNotes(item.asin, event.target.value)}
                    />
                  </td>
                  <td>
                    <button
                      className="btn danger"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        unpin(item.asin);
                      }}
                    >
                      Unpin
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
