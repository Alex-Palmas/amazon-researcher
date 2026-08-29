import { useEffect, useMemo, useState } from "react";
import { ProductThumb } from "../components/ProductThumb";
import { dutyRateForCategory } from "../lib/catalog";
import { formatMoney, formatPct, pnlClass } from "../lib/format";
import { runProfit } from "../lib/profit";
import type { FeeAssumptions, Listing } from "../types";

interface Props {
  listings: Listing[];
  fees: FeeAssumptions;
}

export function Profit({ listings, fees }: Props) {
  const sourced = listings.filter((row) => row.fob != null || row.price != null);
  const [asin, setAsin] = useState("B0DM4QRMP7");
  const listing = listings.find((row) => row.asin === asin);

  const [price, setPrice] = useState<string>("");
  const [fob, setFob] = useState<string>("");
  const [weight, setWeight] = useState<string>("");
  const [dutyPct, setDutyPct] = useState(fees.dutyOtherSportsPct);
  const [fba, setFba] = useState<string>("");
  const [referralPct, setReferralPct] = useState(fees.referralPct);
  const [tacosPct, setTacosPct] = useState(fees.tacosPct);
  const [applyFuel, setApplyFuel] = useState(false);

  useEffect(() => {
    if (!listing) return;
    setPrice(listing.price == null ? "" : String(listing.price));
    setFob(listing.fob == null ? "" : String(listing.fob));
    setFba(listing.fba == null ? "" : String(listing.fba));
    setDutyPct(dutyRateForCategory(listing.category, fees));
    setReferralPct(fees.referralPct);
    setTacosPct(fees.tacosPct);
    if (listing.freight != null && fees.oceanDdpPerKg > 0) {
      setWeight((listing.freight / fees.oceanDdpPerKg).toFixed(3));
    } else {
      setWeight("");
    }
    setApplyFuel(false);
  }, [listing, fees]);

  const num = (value: string) => (value === "" ? null : Number(value));
  const outputs = useMemo(
    () =>
      runProfit(
        {
          price: num(price),
          fob: num(fob),
          weightKg: num(weight),
          dutyPct,
          fba: num(fba),
          referralPct,
          tacosPct,
          units: listing?.units ?? null,
          applyFuel,
        },
        fees,
      ),
    [price, fob, weight, dutyPct, fba, referralPct, tacosPct, listing, applyFuel, fees],
  );

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Profit lab</h1>
          <p className="lede">
            Interactive stack from Settings / scrape fee assumptions. FBA is never invented — type it when the listing
            has none.
          </p>
        </div>
      </div>

      <div className="form-row">
        <select value={asin} onChange={(event) => setAsin(event.target.value)}>
          {sourced.map((row) => (
            <option key={row.asin} value={row.asin}>
              {row.asin} — {row.title.slice(0, 70)}
            </option>
          ))}
        </select>
      </div>

      {listing && (
        <div className="card product-card" style={{ cursor: "default", margin: "12px 0" }}>
          <ProductThumb listing={listing} size="hero" />
          <div>
            <p className="asin">{listing.asin}</p>
            <p className="product-title">{listing.title}</p>
            <p className="muted">
              Seeded unit {formatMoney(listing.unit)} · after ads {formatMoney(listing.afterAdsMonthly)} · units{" "}
              {listing.units ?? "—"}
            </p>
          </div>
        </div>
      )}

      <div className="calc-grid">
        <label>
          Amazon price
          <input value={price} onChange={(event) => setPrice(event.target.value)} type="number" step="0.01" />
        </label>
        <label>
          FOB
          <input value={fob} onChange={(event) => setFob(event.target.value)} type="number" step="0.01" />
        </label>
        <label>
          Weight kg
          <input
            value={weight}
            onChange={(event) => setWeight(event.target.value)}
            type="number"
            step="0.001"
            placeholder="needed for freight"
          />
        </label>
        <label>
          Duty rate
          <select value={String(dutyPct)} onChange={(event) => setDutyPct(Number(event.target.value))}>
            <option value={fees.dutyBagsPct}>Bags 42.6%</option>
            <option value={fees.dutyBallsPct}>Balls 12.9%</option>
            <option value={fees.dutyOtherSportsPct}>Other sports 11.5%</option>
          </select>
        </label>
        <label>
          FBA
          <input
            value={fba}
            onChange={(event) => setFba(event.target.value)}
            type="number"
            step="0.01"
            placeholder="enter FBA — not invented"
          />
        </label>
        <label>
          Referral %
          <input
            value={referralPct}
            onChange={(event) => setReferralPct(Number(event.target.value))}
            type="number"
            step="0.01"
          />
        </label>
        <label>
          TACOS {Math.round(tacosPct * 100)}%
          <input
            type="range"
            min={0}
            max={0.4}
            step={0.01}
            value={tacosPct}
            onChange={(event) => setTacosPct(Number(event.target.value))}
          />
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={applyFuel}
            onChange={(event) => setApplyFuel(event.target.checked)}
          />
          Apply 3.5% fuel on typed FBA
        </label>
      </div>

      <div className="kpis">
        <Out label="Freight" value={formatMoney(outputs.freight)} />
        <Out label="Duty" value={formatMoney(outputs.duty)} />
        <Out label="Landed" value={formatMoney(outputs.landed)} />
        <Out label="Fees" value={formatMoney(outputs.fees)} />
        <Out label="Unit profit" value={formatMoney(outputs.unitProfit)} cls={pnlClass(outputs.unitProfit)} />
        <Out label="Break-even ACOS" value={formatPct(outputs.breakEvenAcos)} />
        <Out label="Monthly at listing units" value={formatMoney(outputs.monthly)} cls={pnlClass(outputs.monthly)} />
        <Out label="After TACOS" value={formatMoney(outputs.afterTacos)} cls={pnlClass(outputs.afterTacos)} />
      </div>
      <p className="note">{fees.monthlyProfitNote}</p>
    </div>
  );
}

function Out({ label, value, cls }: { label: string; value: string; cls?: string }) {
  return (
    <div className="kpi">
      <div className="kpi-label">{label}</div>
      <div className={`kpi-value ${cls ?? ""}`}>{value}</div>
    </div>
  );
}
