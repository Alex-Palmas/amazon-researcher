import { useState } from "react";
import { MINE_ASINS, type KeywordRow, type Listing } from "../types";

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
  const mine = listings.filter((row) => row.mine);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Keywords</h1>
          <p className="lede">
            Local tracker only. Seed ranks and volumes stay empty — no fabricated search volume or rank history.
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
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Add a keyword"
          aria-label="Add a keyword"
        />
        <button className="btn" type="submit">
          Add
        </button>
      </form>

      <p className="note">
        Default watch list is all four Roore ASINs: {MINE_ASINS.join(", ")}. Toggle chips to add or remove.
        Volume is labeled add your own later until you type a number.
      </p>

      <div className="table-wrap" style={{ marginTop: 16 }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ cursor: "default" }}>Keyword</th>
              <th style={{ cursor: "default" }}>Rank</th>
              <th style={{ cursor: "default" }}>Volume</th>
              <th style={{ cursor: "default" }}>Watching</th>
              <th style={{ cursor: "default" }}></th>
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
                    placeholder="—"
                    value={row.rank ?? ""}
                    onChange={(event) =>
                      updateKeyword(row.id, {
                        rank: event.target.value === "" ? null : Number(event.target.value),
                      })
                    }
                    aria-label={`Rank for ${row.phrase}`}
                  />
                </td>
                <td>
                  <input
                    type="number"
                    min={0}
                    placeholder="add your own later"
                    value={row.volume ?? ""}
                    onChange={(event) =>
                      updateKeyword(row.id, {
                        volume: event.target.value === "" ? null : Number(event.target.value),
                      })
                    }
                    aria-label={`Volume for ${row.phrase}`}
                    style={{ width: 160 }}
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
                          title={listing.title}
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
    </div>
  );
}
