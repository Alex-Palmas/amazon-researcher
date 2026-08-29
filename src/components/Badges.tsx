import { isTrendingNew, survivesAdStress } from "../lib/catalog";
import type { Listing } from "../types";

export function ProductBadges({ listing }: { listing: Listing }) {
  return (
    <div className="badge-row">
      {listing.badge === "BEST" && <span className="badge best">BEST</span>}
      {isTrendingNew(listing) && <span className="badge trend">TRENDING</span>}
      {listing.mine && <span className="badge watch">MINE</span>}
      {survivesAdStress(listing) && <span className="badge ok">SURVIVES 15% ADS</span>}
      {listing.sourced === "yes" && <span className="badge ok">SOURCED</span>}
      {listing.sourced === "no" && <span className="badge miss">NOT SOURCED</span>}
      {listing.sourced === "unknown" && <span className="badge watch">SRC UNKNOWN</span>}
    </div>
  );
}
