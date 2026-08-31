import { AlertCard } from "../components/AlertCard";
import { Kpi } from "../components/Kpi";
import type { AlertsFile, Listing } from "../types";

interface Props {
  file: AlertsFile | null;
  ready: boolean;
  listings: Listing[];
  onOpen: (listing: Listing) => void;
}

export function Alerts({ file, ready, listings, onOpen }: Props) {
  const byAsin = new Map(listings.map((row) => [row.asin, row]));
  const alerts = file?.alerts ?? [];
  const watch = alerts.filter((row) => row.severity === "watch").length;
  const warn = alerts.filter((row) => row.severity === "warn").length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Alerts</h1>
          <p className="lede">
            This week vs the prior snapshot. SERP occupancy, Best Seller rank, and New Release tape/weights. No invented
            ranks.
          </p>
        </div>
      </div>

      {!ready ? (
        <p className="note">Loading alerts…</p>
      ) : !file ? (
        <p className="note">alerts.json is missing. Nothing invented.</p>
      ) : (
        <>
          <div className="kpis">
            <Kpi label="Alerts" value={alerts.length} sub={`${file.generatedAt} ${file.timezone ?? ""}`.trim()} />
            <Kpi label="Watch" value={watch} sub="SERP and New Release tape" />
            <Kpi label="Warn" value={warn} sub="none this week" />
            <Kpi label="Info" value={alerts.length - watch - warn} sub="baseline + occupancy" />
          </div>
          <p className="note">{file.note}</p>
          <section className="section">
            <div className="alert-rail">
              {alerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  listing={alert.asin ? byAsin.get(alert.asin) ?? null : null}
                  onOpen={onOpen}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
