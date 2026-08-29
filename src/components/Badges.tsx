import type { Listing } from "../types";

export function ProductBadges({ listing }: { listing: Listing }) {
  return (
    <div className="badge-row">
      {listing.badge === "BEST" && <span className="badge best">BEST</span>}
      {listing.trending && <span className="badge trend">TRENDING</span>}
      {listing.mine && <span className="badge mine">MINE</span>}
      {listing.sourced === "yes" && <span className="badge ok">SOURCED</span>}
      {listing.sourced === "no" && <span className="badge miss">BRAND-LOCKED</span>}
      {listing.sourced === "unknown" && <span className="badge watch">SRC UNKNOWN</span>}
      {listing.profitExcluded && <span className="badge miss">PROFIT EXCLUDED</span>}
    </div>
  );
}
