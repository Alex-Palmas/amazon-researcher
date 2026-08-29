import { useMemo, useState } from "react";
import {
  compareValues,
  formatMoney,
  formatNumber,
  formatUnits,
  netAfterAdStress,
} from "../lib/catalog";
import type { Listing } from "../types";
import { ProductBadges } from "./Badges";
import { ProductThumb } from "./ProductThumb";

type SortKey =
  | "title"
  | "price"
  | "rating"
  | "reviews"
  | "units"
  | "sourced"
  | "fob"
  | "unit"
  | "ads"
  | "net";

const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "title", label: "Product" },
  { key: "price", label: "Price" },
  { key: "rating", label: "Rating" },
  { key: "reviews", label: "Reviews" },
  { key: "units", label: "Units" },
  { key: "sourced", label: "Src" },
  { key: "fob", label: "FOB" },
  { key: "unit", label: "Unit" },
  { key: "ads", label: "Ads" },
  { key: "net", label: "Net @15% ads" },
];

function sortValue(row: Listing, key: SortKey): string | number | null {
  if (key === "net") return netAfterAdStress(row);
  if (key === "title") return row.title;
  const value = row[key];
  return value ?? null;
}

interface Props {
  listings: Listing[];
  onOpen: (listing: Listing) => void;
}

export function ListingTable({ listings, onOpen }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("units");
  const [dir, setDir] = useState<"asc" | "desc">("desc");

  const rows = useMemo(() => {
    const copy = [...listings];
    copy.sort((a, b) => {
      const cmp = compareValues(sortValue(a, sortKey), sortValue(b, sortKey));
      return dir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [listings, sortKey, dir]);

  const onSort = (key: SortKey) => {
    if (key === sortKey) {
      setDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setDir(key === "title" || key === "sourced" ? "asc" : "desc");
  };

  return (
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col.key} onClick={() => onSort(col.key)}>
                {col.label}
                {sortKey === col.key ? (dir === "asc" ? " ↑" : " ↓") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const net = netAfterAdStress(row);
            return (
              <tr key={row.asin} onClick={() => onOpen(row)} style={{ cursor: "pointer" }}>
                <td>
                  <div className="product-cell">
                    <ProductThumb listing={row} />
                    <div>
                      <div className="product-title">{row.title}</div>
                      <div className="asin">{row.asin}</div>
                      <ProductBadges listing={row} />
                    </div>
                  </div>
                </td>
                <td className="num">{formatMoney(row.price)}</td>
                <td className="num">{row.rating == null ? "—" : row.rating.toFixed(1)}</td>
                <td className="num">{formatNumber(row.reviews)}</td>
                <td className="num">{formatUnits(row)}</td>
                <td>{row.sourced ?? "—"}</td>
                <td className="num">{formatMoney(row.fob)}</td>
                <td className="num">{formatMoney(row.unit)}</td>
                <td className="num">{formatMoney(row.ads)}</td>
                <td className={`num ${net != null && net > 0 ? "pos" : net != null ? "neg" : ""}`}>
                  {formatMoney(net)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
