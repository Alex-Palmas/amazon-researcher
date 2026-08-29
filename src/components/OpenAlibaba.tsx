import { alibabaHref } from "../lib/alibaba";
import type { Listing } from "../types";

export function OpenAlibaba({ listing }: { listing: Listing }) {
  const href = alibabaHref(listing);
  if (!href) return null;
  return (
    <a className="btn" href={href} target="_blank" rel="noreferrer">
      Open Alibaba
    </a>
  );
}
