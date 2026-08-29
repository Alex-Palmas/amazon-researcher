import { formatMoney, formatRating, formatUnits, pnlClass } from "../lib/format";
import type { Listing } from "../types";
import { ProductBadges } from "./Badges";
import { ProductThumb } from "./ProductThumb";

interface Props {
  listing: Listing;
  onOpen: (listing: Listing) => void;
  extra?: string;
}

export function ProductCard({ listing, onOpen, extra }: Props) {
  return (
    <button className="card product-card" onClick={() => onOpen(listing)}>
      <ProductThumb listing={listing} size="hero" />
      <div className="product-copy">
        <p className="asin">{listing.asin}</p>
        <p className="product-title">{listing.title}</p>
        <p className="muted">
          {formatMoney(listing.price)}
          {listing.listPrice ? ` list ${formatMoney(listing.listPrice)}` : ""}
          {" · "}
          {formatRating(listing)}
          {" · "}
          {formatUnits(listing)}
        </p>
        {extra && <p className="muted">{extra}</p>}
        {listing.afterAdsMonthly != null && (
          <p className={pnlClass(listing.afterAdsMonthly)}>
            After 15% TACOS {formatMoney(listing.afterAdsMonthly)}
          </p>
        )}
        <ProductBadges listing={listing} />
      </div>
    </button>
  );
}
