import { useCallback, useEffect, useState } from "react";
import { SETTINGS_STORAGE, type FeeAssumptions } from "../types";

function readSettings(defaults: FeeAssumptions): FeeAssumptions {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE);
    if (!raw) return defaults;
    return { ...defaults, ...(JSON.parse(raw) as Partial<FeeAssumptions>) };
  } catch {
    return defaults;
  }
}

export function useSettings(defaults: FeeAssumptions) {
  const [fees, setFees] = useState<FeeAssumptions>(() => readSettings(defaults));

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(fees));
  }, [fees]);

  const update = useCallback((patch: Partial<FeeAssumptions>) => {
    setFees((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => {
    setFees(defaults);
  }, [defaults]);

  return { fees, update, reset };
}
