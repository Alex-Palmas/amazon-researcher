import type { CatalogMeta, FeeAssumptions } from "../types";

interface Props {
  meta: CatalogMeta;
  fees: FeeAssumptions;
  update: (patch: Partial<FeeAssumptions>) => void;
  reset: () => void;
}

export function SettingsPage({ meta, fees, update, reset }: Props) {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Settings</h1>
          <p className="lede">
            Fee assumptions persist in localStorage. Reset returns to the {meta.scrapedAt} {meta.timezone} scrape
            defaults.
          </p>
        </div>
        <button className="btn ghost" type="button" onClick={reset}>
          Reset to scrape defaults
        </button>
      </div>

      <div className="calc-grid">
        <Num label="Referral" value={fees.referralPct} onChange={(v) => update({ referralPct: v })} />
        <Num label="TACOS" value={fees.tacosPct} onChange={(v) => update({ tacosPct: v })} />
        <Num label="FBA fuel" value={fees.fbaFuelPct} onChange={(v) => update({ fbaFuelPct: v })} />
        <Num label="Bag duty" value={fees.dutyBagsPct} onChange={(v) => update({ dutyBagsPct: v })} />
        <Num label="Ball duty" value={fees.dutyBallsPct} onChange={(v) => update({ dutyBallsPct: v })} />
        <Num label="Other sports duty" value={fees.dutyOtherSportsPct} onChange={(v) => update({ dutyOtherSportsPct: v })} />
        <Num label="Ocean DDP / kg" value={fees.oceanDdpPerKg} onChange={(v) => update({ oceanDdpPerKg: v })} />
      </div>
      <p className="note">
        Reciprocal overlay: {fees.reciprocalOverlay ? "on" : "off (scrape default)"}. Do not invent one.
      </p>
      <p className="note">{fees.monthlyProfitNote}</p>
      <p className="note">
        Scrape stamp: {meta.source}. Catalog reviews {meta.catalogReviews}, weighted {meta.weightedRating.toFixed(2)}.{" "}
        {meta.listingCount} rows · {meta.researchCount} research · {meta.sourcedCount} sourced · {meta.trendingCount}{" "}
        trending. Accessories popularity rank is `rank`. Best Seller / New Release ranks land with the next scrape.
      </p>
    </div>
  );
}

function Num({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      {label}
      <input type="number" step="0.001" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}
