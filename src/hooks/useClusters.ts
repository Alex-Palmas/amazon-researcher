import { useCallback, useEffect, useState } from "react";
import {
  CARRY_CATEGORIES,
  CLUSTER_STORAGE,
  TAPE_CATEGORIES,
  type Listing,
} from "../types";

export interface Cluster {
  id: "tape" | "carry";
  name: string;
  asins: string[];
}

function seedClusters(listings: Listing[]): Cluster[] {
  const tape = listings
    .filter((row) => TAPE_CATEGORIES.includes(row.category as (typeof TAPE_CATEGORIES)[number]))
    .map((row) => row.asin);
  const carry = listings
    .filter((row) => CARRY_CATEGORIES.includes(row.category as (typeof CARRY_CATEGORIES)[number]))
    .map((row) => row.asin);
  return [
    { id: "tape", name: "Tape", asins: tape },
    { id: "carry", name: "Carry", asins: carry },
  ];
}

function readStore(listings: Listing[]): Cluster[] {
  const seeded = seedClusters(listings);
  try {
    const raw = localStorage.getItem(CLUSTER_STORAGE);
    if (!raw) return seeded;
    const parsed = JSON.parse(raw) as Cluster[];
    if (!Array.isArray(parsed) || parsed.length < 2) return seeded;
    const catalog = new Set(listings.map((row) => row.asin));
    return parsed.map((cluster) => ({
      ...cluster,
      asins: cluster.asins.filter((asin) => catalog.has(asin)),
    }));
  } catch {
    return seeded;
  }
}

export function useClusters(listings: Listing[]) {
  const [clusters, setClusters] = useState<Cluster[]>(() => readStore(listings));

  useEffect(() => {
    localStorage.setItem(CLUSTER_STORAGE, JSON.stringify(clusters));
  }, [clusters]);

  const addAsin = useCallback((id: Cluster["id"], asin: string) => {
    setClusters((prev) =>
      prev.map((cluster) =>
        cluster.id === id && !cluster.asins.includes(asin)
          ? { ...cluster, asins: [...cluster.asins, asin] }
          : cluster,
      ),
    );
  }, []);

  const removeAsin = useCallback((id: Cluster["id"], asin: string) => {
    setClusters((prev) =>
      prev.map((cluster) =>
        cluster.id === id
          ? { ...cluster, asins: cluster.asins.filter((item) => item !== asin) }
          : cluster,
      ),
    );
  }, []);

  const reset = useCallback(() => {
    setClusters(seedClusters(listings));
  }, [listings]);

  return { clusters, addAsin, removeAsin, reset };
}
