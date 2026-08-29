import { parseAlibabaMoq } from "../lib/alibaba";
import { OpenAlibaba } from "./OpenAlibaba";
import { amazonUrl, formatMoney, formatNumber, formatPct, formatUnits, pnlClass } from "../lib/format";
import type { Listing } from "../types";
import { ProductBadges } from "./Badges";
import { ProductThumb } from "./ProductThumb";

interface Props {
  listing: Listing;
  onClose: () => void;
  onTrack?: (asin: string) => void;
}

export function DetailDrawer({ listing, onClose, onTrack }: Props) {
  const moq = listing.alibaba ? parseAlibabaMoq(listing.alibaba) : null;
  return (
    <>
      <button className="drawer-backdrop" aria-label="Close drawer" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label={listing.title}>
        <div className="drawer-hero">
          <ProductThumb listing={listing} size="hero" />
          <div>
            <p className="asin">{listing.asin}</p>
            <h2 className="product-title">{listing.title}</h2>
            <p className="muted">
              {listing.brand ?? "—"} · {listing.category?.replaceAll("_", " ") ?? "—"}
              {listing.rank != null ? ` · rank ${listing.rank}` : ""}
            </p>
            <ProductBadges listing={listing} />
          </div>
        </div>
        <div className="drawer-body">
          <div className="stat-grid">
            <Stat label="Price" value={formatMoney(listing.price)} />
            <Stat label="List" value={formatMoney(listing.listPrice)} />
            <Stat label="Rating" value={listing.rating == null ? "—" : listing.rating.toFixed(1)} />
            <Stat label="Reviews" value={formatNumber(listing.reviews)} />
            <Stat label="Units / mo" value={formatUnits(listing)} />
            <Stat label="Opportunity" value={formatNumber(listing.opportunity, 1)} />
            <Stat label="FOB" value={formatMoney(listing.fob)} />
            <Stat label="Freight" value={formatMoney(listing.freight)} />
            <Stat label="Duty" value={formatMoney(listing.duty)} />
            <Stat label="Landed" value={formatMoney(listing.landed)} />
            <Stat label="Referral" value={formatMoney(listing.referral)} />
            <Stat label="FBA" value={formatMoney(listing.fba)} />
            <Stat label="Unit before ads" value={formatMoney(listing.unit)} cls={pnlClass(listing.unit)} />
            <Stat label="Margin" value={formatPct(listing.margin, true)} />
            <Stat label="Monthly revenue" value={formatMoney(listing.monthlyRevenue)} />
            <Stat label="Monthly profit" value={formatMoney(listing.monthlyProfit)} cls={pnlClass(listing.monthlyProfit)} />
            <Stat
              label="After 15% TACOS"
              value={formatMoney(listing.afterAdsMonthly)}
              cls={pnlClass(listing.afterAdsMonthly)}
            />
          </div>
          {listing.alibaba ? (
            <div className="source-block">
              <strong>Source found on Alibaba</strong>
              <p className="copyable">{listing.alibaba}</p>
              <p className="muted">
                FOB {formatMoney(listing.fob)}
                {moq ? ` · MOQ/qty ${moq}` : ""}
              </p>
              {listing.notes && <p className="muted">{listing.notes}</p>}
            </div>
          ) : listing.sourced === "yes" ? (
            <p className="note" style={{ marginTop: 12 }}>
              Sourced, match text missing
            </p>
          ) : null}
          <div className="form-row">
            <a className="btn" href={amazonUrl(listing)} target="_blank" rel="noreferrer">
              Open Amazon
            </a>
            <OpenAlibaba listing={listing} />
            {onTrack && (
              <button className="btn ghost" type="button" onClick={() => onTrack(listing.asin)}>
                Watch
              </button>
            )}
            <button className="btn ghost" type="button" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function Stat({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong className={cls}>{value}</strong>
    </div>
  );
}
