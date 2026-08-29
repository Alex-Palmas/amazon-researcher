import type { FeeAssumptions } from "../types";

export interface ProfitInputs {
  price: number | null;
  fob: number | null;
  weightKg: number | null;
  dutyPct: number;
  fba: number | null;
  referralPct: number;
  tacosPct: number;
  units: number | null;
  applyFuel: boolean;
}

export interface ProfitOutputs {
  freight: number | null;
  duty: number | null;
  landed: number | null;
  referral: number | null;
  fbaTotal: number | null;
  fees: number | null;
  unitProfit: number | null;
  breakEvenAcos: number | null;
  monthly: number | null;
  afterTacos: number | null;
}

export function runProfit(inputs: ProfitInputs, fees: FeeAssumptions): ProfitOutputs {
  const freight =
    inputs.weightKg != null ? inputs.weightKg * fees.oceanDdpPerKg : null;
  const duty = inputs.fob != null ? inputs.fob * inputs.dutyPct : null;
  const landed =
    inputs.fob != null && freight != null && duty != null
      ? inputs.fob + freight + duty
      : null;
  const referral =
    inputs.price != null ? inputs.price * inputs.referralPct : null;
  const fbaTotal =
    inputs.fba != null
      ? inputs.applyFuel
        ? inputs.fba * (1 + fees.fbaFuelPct)
        : inputs.fba
      : null;
  const feesSum =
    referral != null && fbaTotal != null ? referral + fbaTotal : null;
  const unitProfit =
    inputs.price != null && landed != null && feesSum != null
      ? inputs.price - landed - feesSum
      : null;
  const breakEvenAcos =
    unitProfit != null && inputs.price != null && inputs.price > 0
      ? unitProfit / inputs.price
      : null;
  const monthly =
    unitProfit != null && inputs.units != null ? unitProfit * inputs.units : null;
  const afterTacos =
    monthly != null && inputs.price != null && inputs.units != null
      ? monthly - inputs.price * inputs.units * inputs.tacosPct
      : null;
  return {
    freight,
    duty,
    landed,
    referral,
    fbaTotal,
    fees: feesSum,
    unitProfit,
    breakEvenAcos,
    monthly,
    afterTacos,
  };
}
