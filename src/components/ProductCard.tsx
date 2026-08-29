import { formatMoney, formatRating, formatUnits, netAfterAdStress } from "../lib/catalog";
import type { Listing } from "../types";
import { ProductBadges } from "./Badges";
import { ProductThumb } from "./ProductThumb";

interface Props {
  listing: Listing;
  onOpen: (listing: Listing) => void;
  extra?: string;
}

export function ProductCard({ listing, onOpen, extra }: Props) {
  const net = netAfterAdStress(listing);
  return (
    <button className="card product-card" onClick={() => onOpen(listing)}>
      <ProductThumb listing={listing} size="hero" />
      <div className="product-copy">
        <p className="asin">{listing.asin}</p>
        <p className="product-title">{listing.title}</p>
        <p className="muted">
          {formatMoney(listing.price)}
          {listing.listPrice ? ` list ${formatMoney(listing.listPrice)}` : ""}
          {listing.typicalPrice ? ` typical ${formatMoney(listing.typicalPrice)}` : ""}
          {" · "}
          {formatRating(listing)}
          {" · "}
          {formatUnits(listing)}
        </p>
        {extra && <p className="muted">{extra}</p>}
        {net != null && (
          <p className={net > 0 ? "pos" : "neg"}>Net after 15% ads {formatMoney(net)}</p>
        )}
        <ProductBadges listing={listing} />
      </div>
    </button>
  );
}
