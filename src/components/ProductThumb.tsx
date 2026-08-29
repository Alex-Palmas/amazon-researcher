import type { Listing } from "../types";

interface Props {
  listing: Listing;
  size?: "hero" | "thumb";
}

export function ProductThumb({ listing, size = "thumb" }: Props) {
  return (
    <img
      className={size === "hero" ? "hero-img" : "thumb"}
      src={listing.image}
      alt={listing.title}
      width={size === "hero" ? 92 : 56}
      height={size === "hero" ? 92 : 56}
      loading="lazy"
    />
  );
}
