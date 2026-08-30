import { ProductThumb } from "./ProductThumb";
import type { AppAlert, Listing } from "../types";

interface Props {
  alert: AppAlert;
  listing: Listing | null;
  onOpen: (listing: Listing) => void;
}

export function AlertCard({ alert, listing, onOpen }: Props) {
  const clickable = Boolean(listing);
  const className = `card alert-card sev-${alert.severity}${listing ? " photo-alert" : ""}`;

  const inner = (
    <>
      {listing && <ProductThumb listing={listing} size="hero" />}
      <div>
        <div className="badge-row" style={{ marginTop: 0 }}>
          <span className={`badge ${alert.severity}`}>{alert.severity.toUpperCase()}</span>
          <span className="badge watch">{alert.kind.replaceAll("_", " ")}</span>
        </div>
        <strong>{alert.title}</strong>
        <p>{alert.body}</p>
        <span className="muted">
          {alert.date}
          {alert.asin ? ` · ${alert.asin}` : ""}
        </span>
      </div>
    </>
  );

  if (clickable && listing) {
    return (
      <button className={className} type="button" onClick={() => onOpen(listing)}>
        {inner}
      </button>
    );
  }

  return <div className={className}>{inner}</div>;
}
