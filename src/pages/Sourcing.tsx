import { useMemo, useState } from "react";
import { ProductThumb } from "../components/ProductThumb";
import { categoriesOf } from "../lib/catalog";
import { OpenAlibaba } from "../components/OpenAlibaba";
import { amazonUrl, formatMoney, pnlClass } from "../lib/format";
import type { Listing } from "../types";

interface Props {
  listings: Listing[];
  onOpen: (listing: Listing) => void;
}

export function Sourcing({ listings, onOpen }: Props) {
  const rows = listings.filter((row) => row.sourced === "yes" && !row.mine && !row.profitExcluded);
  const cats = categoriesOf(rows);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (category !== "all" && row.category !== category) return false;
      if (
        q &&
        !row.asin.toLowerCase().includes(q) &&
        !row.title.toLowerCase().includes(q) &&
        !(row.alibaba ?? "").toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [rows, query, category]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Sourcing</h1>
          <p className="lede">
            Sourced=yes, not mine, not profit-excluded. Alibaba text is from the scrape — no invented FOBs.
          </p>
        </div>
      </div>

      <div className="form-row">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title / Alibaba" />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="all">All categories</option>
          {cats.map((cat) => (
            <option key={cat} value={cat}>
              {cat.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>FOB</th>
              <th>Freight</th>
              <th>Duty</th>
              <th>Landed</th>
              <th>Unit</th>
              <th>After ads</th>
              <th>Alibaba</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((row) => (
              <tr key={row.asin} onClick={() => onOpen(row)}>
                <td>
                  <div className="product-cell">
                    <ProductThumb listing={row} />
                    <div>
                      <div className="product-title">{row.title}</div>
                      <div className="asin">
                        {row.asin} ·{" "}
                        <a href={amazonUrl(row)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                          Amazon
                        </a>
                      </div>
                      {row.alibaba && (
                        <div onClick={(event) => event.stopPropagation()} style={{ marginTop: 6 }}>
                          <OpenAlibaba listing={row} />
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td>{row.category?.replaceAll("_", " ")}</td>
                <td className="num">{formatMoney(row.fob)}</td>
                <td className="num">{formatMoney(row.freight)}</td>
                <td className="num">{formatMoney(row.duty)}</td>
                <td className="num">{formatMoney(row.landed)}</td>
                <td className={`num ${pnlClass(row.unit)}`}>{formatMoney(row.unit)}</td>
                <td className={`num ${pnlClass(row.afterAdsMonthly)}`}>{formatMoney(row.afterAdsMonthly)}</td>
                <td>
                  <div className="clamp" title={row.alibaba ?? undefined}>
                    {row.alibaba ?? "—"}
                  </div>
                  {row.notes && <div className="muted clamp">{row.notes}</div>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
