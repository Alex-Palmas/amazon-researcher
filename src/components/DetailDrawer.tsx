import {
  amazonUrl,
  formatMoney,
  formatNumber,
  formatRating,
  formatUnits,
  monthlyRevenue,
  netAfterAdStress,
  observedAcos,
} from "../lib/catalog";
import type { Listing } from "../types";
import { ProductBadges } from "./Badges";
import { ProductThumb } from "./ProductThumb";

interface Props {
  listing: Listing;
  onClose: () => void;
}

export function DetailDrawer({ listing, onClose }: Props) {
  const net = netAfterAdStress(listing);
  const rev = monthlyRevenue(listing);
  const acos = observedAcos(listing);

  return (
    <>
      <button className="drawer-backdrop" aria-label="Close drawer" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label={listing.title}>
        <div className="drawer-hero">
          <ProductThumb listing={listing} size="hero" />
          <div>
            <p className="asin">{listing.asin}</p>
            <h2 className="product-title">{listing.title}</h2>
            {listing.brand && <p className="muted">{listing.brand}</p>}
            <ProductBadges listing={listing} />
          </div>
        </div>
        <div className="drawer-body">
          <div className="stat-grid">
            <div className="stat">
              <span>Price</span>
              <strong>{formatMoney(listing.price)}</strong>
            </div>
            <div className="stat">
              <span>List / typical</span>
              <strong>
                {listing.listPrice
                  ? formatMoney(listing.listPrice)
                  : listing.typicalPrice
                    ? formatMoney(listing.typicalPrice)
                    : "—"}
              </strong>
            </div>
            <div className="stat">
              <span>Rating / reviews</span>
              <strong>{formatRating(listing)}</strong>
            </div>
            <div className="stat">
              <span>Units / mo</span>
              <strong>{formatUnits(listing)}</strong>
            </div>
            <div className="stat">
              <span>FOB</span>
              <strong>{formatMoney(listing.fob)}</strong>
            </div>
            <div className="stat">
              <span>Unit</span>
              <strong>{formatMoney(listing.unit)}</strong>
            </div>
            <div className="stat">
              <span>Ads / mo</span>
              <strong>{formatMoney(listing.ads)}</strong>
            </div>
            <div className="stat">
              <span>Observed ACOS</span>
              <strong>{acos == null ? "—" : `${(acos * 100).toFixed(1)}%`}</strong>
            </div>
            <div className="stat">
              <span>Revenue / mo</span>
              <strong>{formatMoney(rev)}</strong>
            </div>
            <div className="stat">
              <span>Net after 15% ads</span>
              <strong className={net != null && net > 0 ? "pos" : net != null ? "neg" : undefined}>
                {formatMoney(net)}
              </strong>
            </div>
          </div>
          <p className="note" style={{ marginTop: 14 }}>
            15% ads stress = price − FOB − unit − 15% of price. No invented fees.
            Missing FOB or unit stays blank. Reviews {formatNumber(listing.reviews)}.
          </p>
          <div className="form-row">
            <a className="btn" href={amazonUrl(listing.asin)} target="_blank" rel="noreferrer">
              Open Amazon
            </a>
            <button className="btn ghost" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
