import { useMemo, useState } from "react";
import { ProductThumb } from "../components/ProductThumb";
import { notChecked } from "../lib/format";
import { titleHasPhrase, tokenFrequency, tokenize } from "../lib/tokens";
import { MINE_ASINS, ROORE_TAPE_ASINS, TAPE_CATEGORIES, type KeywordRow, type Listing } from "../types";

interface Props {
  listings: Listing[];
  keywords: KeywordRow[];
  addKeyword: (phrase: string) => void;
  removeKeyword: (id: string) => void;
  updateKeyword: (id: string, patch: Partial<KeywordRow>) => void;
  toggleWatch: (id: string, asin: string) => void;
}

export function Keywords({
  listings,
  keywords,
  addKeyword,
  removeKeyword,
  updateKeyword,
  toggleWatch,
}: Props) {
  const [draft, setDraft] = useState("");
  const [reverseAsin, setReverseAsin] = useState("B0GDC2M73C");
  const mine = listings.filter((row) => row.mine);
  const selected = listings.find((row) => row.asin === reverseAsin) ?? listings[0];

  const reverse = useMemo(() => {
    if (!selected) return [];
    const peers = listings.filter((row) => row.category === selected.category);
    const freq = tokenFrequency(peers.map((row) => row.title));
    return tokenize(selected.title)
      .map((token) => ({ token, count: freq.get(token) ?? 0, n: peers.length }))
      .sort((a, b) => b.count - a.count);
  }, [listings, selected]);

  const gaps = useMemo(() => {
    const tape = listings
      .filter((row) => TAPE_CATEGORIES.includes(row.category as (typeof TAPE_CATEGORIES)[number]))
      .slice()
      .sort((a, b) => (b.units ?? -1) - (a.units ?? -1));
    const top = tape.slice(0, 12);
    const freq = tokenFrequency(top.map((row) => row.title));
    const rooreTitles = listings
      .filter((row) => ROORE_TAPE_ASINS.includes(row.asin as (typeof ROORE_TAPE_ASINS)[number]))
      .map((row) => row.title)
      .join(" ")
      .toLowerCase();
    return [...freq.entries()]
      .filter(([token, count]) => count >= 3 && !rooreTitles.includes(token))
      .sort((a, b) => b[1] - a[1])
      .map(([token, count]) => ({ token, count, n: top.length }));
  }, [listings]);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Keywords</h1>
          <p className="lede">
            Local tracker. Seed ranks and volumes stay empty — no Magnet numbers. Empty rank shows not checked, not 0.
          </p>
        </div>
      </div>

      <form
        className="form-row"
        onSubmit={(event) => {
          event.preventDefault();
          addKeyword(draft);
          setDraft("");
        }}
      >
        <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Add a keyword" />
        <button className="btn" type="submit">
          Add
        </button>
      </form>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Keyword</th>
              <th>Rank</th>
              <th>Volume</th>
              <th>Watching</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((row) => (
              <tr key={row.id}>
                <td>
                  <strong>{row.phrase}</strong>
                </td>
                <td>
                  <input
                    type="number"
                    min={1}
                    placeholder="not checked"
                    value={row.rank ?? ""}
                    onChange={(event) =>
                      updateKeyword(row.id, {
                        rank: event.target.value === "" ? null : Number(event.target.value),
                      })
                    }
                  />
                  {row.rank == null && <div className="muted">{notChecked(null)}</div>}
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    placeholder="add your own later"
                    value={row.volume ?? ""}
                    style={{ width: 160 }}
                    onChange={(event) =>
                      updateKeyword(row.id, {
                        volume: event.target.value === "" ? null : Number(event.target.value),
                      })
                    }
                  />
                </td>
                <td>
                  <div className="badge-row">
                    {mine.map((listing) => {
                      const on = row.watching.includes(listing.asin);
                      return (
                        <button
                          key={listing.asin}
                          type="button"
                          className={`badge ${on ? "ok" : "watch"}`}
                          onClick={() => toggleWatch(row.id, listing.asin)}
                        >
                          {listing.asin}
                        </button>
                      );
                    })}
                  </div>
                </td>
                <td>
                  <button className="btn danger" type="button" onClick={() => removeKeyword(row.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="note">Default watch list is all four Roore ASINs: {MINE_ASINS.join(", ")}.</p>

      <section className="section">
        <h2 className="section-title">Reverse ASIN</h2>
        <p className="lede">Title tokens from a catalog listing, counted across the same category. No invented volumes.</p>
        <select value={reverseAsin} onChange={(event) => setReverseAsin(event.target.value)}>
          {listings.map((row) => (
            <option key={row.asin} value={row.asin}>
              {row.asin} — {row.title.slice(0, 80)}
            </option>
          ))}
        </select>
        {selected && (
          <div className="card product-card" style={{ marginTop: 12, cursor: "default" }}>
            <ProductThumb listing={selected} size="hero" />
            <div>
              <p className="asin">{selected.asin}</p>
              <p className="product-title">{selected.title}</p>
            </div>
          </div>
        )}
        <div className="table-wrap" style={{ marginTop: 12 }}>
          <table className="table">
            <thead>
              <tr>
                <th>Token</th>
                <th>In category</th>
                <th>Volume</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {reverse.map((row) => (
                <tr key={row.token}>
                  <td>
                    <strong>{row.token}</strong>
                    {selected && titleHasPhrase(selected.title, row.token) && (
                      <span className="badge ok">IN TITLE</span>
                    )}
                  </td>
                  <td>
                    {row.count} / {row.n}
                  </td>
                  <td className="muted">add your own later</td>
                  <td>
                    <button className="btn" type="button" onClick={() => addKeyword(row.token)}>
                      Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Tape title gaps</h2>
        <p className="lede">
          Tokens in at least 3 of the top-unit tungsten_tape / lead_tape titles that do not appear in Roore tape titles.
        </p>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Token</th>
                <th>Top-tape frequency</th>
                <th>Volume</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {gaps.map((row) => (
                <tr key={row.token}>
                  <td>
                    <strong>{row.token}</strong>
                    <span className="badge miss">MISSING ON ROORE</span>
                  </td>
                  <td>
                    {row.count} / {row.n}
                  </td>
                  <td className="muted">add your own later</td>
                  <td>
                    <button className="btn" type="button" onClick={() => addKeyword(row.token)}>
                      Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
