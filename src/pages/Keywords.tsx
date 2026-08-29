import { useMemo, useState } from "react";
import { PhotoAsinPicker } from "../components/PhotoAsinPicker";
import { ProductThumb } from "../components/ProductThumb";
import { formatNumber, notChecked } from "../lib/format";
import {
  demandProxies,
  maxDemandProxy,
  ranksForAsin,
  type DemandProxy,
  type KeywordRanksFile,
} from "../lib/ranks";
import { titleHasPhrase, tokenFrequency, tokenize } from "../lib/tokens";
import { MINE_ASINS, ROORE_TAPE_ASINS, TAPE_CATEGORIES, type KeywordRow, type Listing } from "../types";

type RankSort = "position" | "page" | "roore" | "demand";

interface Props {
  listings: Listing[];
  keywords: KeywordRow[];
  addKeyword: (phrase: string) => void;
  removeKeyword: (id: string) => void;
  updateKeyword: (id: string, patch: Partial<KeywordRow>) => void;
  toggleWatch: (id: string, asin: string) => void;
  ranks: KeywordRanksFile | null;
}

export function Keywords({
  listings,
  keywords,
  addKeyword,
  removeKeyword,
  updateKeyword,
  toggleWatch,
  ranks,
}: Props) {
  const [draft, setDraft] = useState("");
  const [rankAsin, setRankAsin] = useState("B0BY34Q2ML");
  const [reverseAsin, setReverseAsin] = useState("B0GDC2M73C");
  const mine = listings.filter((row) => row.mine);
  const rankListing = listings.find((row) => row.asin === rankAsin) ?? listings[0];
  const selected = listings.find((row) => row.asin === reverseAsin) ?? listings[0];
  const [rankSort, setRankSort] = useState<RankSort>("position");
  const [rankDir, setRankDir] = useState<"asc" | "desc">("asc");
  const proxies = useMemo(
    () => (ranks ? demandProxies(ranks, listings) : new Map<string, DemandProxy>()),
    [ranks, listings],
  );
  const proxyMax = useMemo(() => maxDemandProxy(proxies), [proxies]);
  const competitorRanks = useMemo(() => {
    const rows = ranks && rankListing ? ranksForAsin(ranks, rankListing.asin) : [];
    return [...rows].sort((a, b) => {
      const pa = proxies.get(a.phrase.toLowerCase());
      const pb = proxies.get(b.phrase.toLowerCase());
      const av =
        rankSort === "demand"
          ? (pa?.demandProxy ?? null)
          : rankSort === "roore"
            ? a.rooreBest
            : rankSort === "page"
              ? a.page
              : a.position;
      const bv =
        rankSort === "demand"
          ? (pb?.demandProxy ?? null)
          : rankSort === "roore"
            ? b.rooreBest
            : rankSort === "page"
              ? b.page
              : b.position;
      const cmp = av == null && bv == null ? 0 : av == null ? 1 : bv == null ? -1 : av - bv;
      return rankDir === "asc" ? cmp : -cmp;
    });
  }, [ranks, rankListing, proxies, rankSort, rankDir]);

  const onRankSort = (key: RankSort) => {
    if (key === rankSort) {
      setRankDir((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setRankSort(key);
    setRankDir(key === "demand" ? "desc" : "asc");
  };

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
              <th>
                Demand proxy
                <div className="muted">bought/mo of ranked catalog listings — not Amazon search volume</div>
              </th>
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
                  <DemandCell proxy={proxies.get(row.phrase.toLowerCase())} max={proxyMax} />
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
        <h2 className="section-title">Competitor keyword ranks</h2>
        <p className="lede">
          Amazon organic positions we scraped — not title tokens, not Magnet estimates. Demand proxy sums
          bought-past-month units of ranked catalog ASINs only. Missing units stay out of the sum.
          {ranks?.checkedAt ? ` Checked ${ranks.checkedAt} ${ranks.timezone}.` : " No rank scrape loaded yet."}
        </p>
        <PhotoAsinPicker
          listings={listings}
          value={rankAsin}
          onChange={setRankAsin}
          label="Competitor / catalog ASIN"
        />
        {ranks == null ? (
          <p className="note" style={{ marginTop: 12 }}>Loading rank scrape…</p>
        ) : competitorRanks.length === 0 ? (
          <p className="note" style={{ marginTop: 12 }}>
            No checked ranks for this listing yet. Ranks are Amazon organic positions we scraped, not estimates.
          </p>
        ) : (
          <div className="table-wrap" style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Keyword</th>
                  <th onClick={() => onRankSort("position")}>
                    Their rank{rankSort === "position" ? (rankDir === "asc" ? " ↑" : " ↓") : ""}
                  </th>
                  <th onClick={() => onRankSort("page")}>
                    Page{rankSort === "page" ? (rankDir === "asc" ? " ↑" : " ↓") : ""}
                  </th>
                  <th onClick={() => onRankSort("roore")}>
                    Best Roore rank{rankSort === "roore" ? (rankDir === "asc" ? " ↑" : " ↓") : ""}
                  </th>
                  <th onClick={() => onRankSort("demand")}>
                    Demand proxy{rankSort === "demand" ? (rankDir === "asc" ? " ↑" : " ↓") : ""}
                    <div className="muted">bought/mo of ranked catalog listings — not Amazon search volume</div>
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {competitorRanks.map((row) => (
                  <tr key={row.phrase}>
                    <td>
                      <strong>{row.phrase}</strong>
                      {row.searchUrl && (
                        <div>
                          <a href={row.searchUrl} target="_blank" rel="noreferrer">
                            Amazon search
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="num">{row.position}</td>
                    <td className="num">{row.page}</td>
                    <td>{row.rooreBest == null ? "not in top results" : row.rooreBest}</td>
                    <td>
                      <DemandCell proxy={proxies.get(row.phrase.toLowerCase())} max={proxyMax} />
                    </td>
                    <td>
                      <button className="btn" type="button" onClick={() => addKeyword(row.phrase)}>
                        Track
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="section">
        <h2 className="section-title">From listing copy</h2>
        <p className="lede">
          Reverse ASIN from title tokens in the same category. This is not Amazon rank data and not search volume.
        </p>
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

function DemandCell({ proxy, max }: { proxy: DemandProxy | undefined; max: number }) {
  if (!proxy) {
    return <span className="muted">not checked</span>;
  }
  if (proxy.demandProxy == null) {
    return (
      <div>
        <span className="muted">—</span>
        <div className="muted">
          {proxy.inCatalog}/{proxy.organicCount} in catalog · no units
        </div>
      </div>
    );
  }
  const width = max > 0 ? `${(proxy.demandProxy / max) * 100}%` : "0%";
  return (
    <div>
      <div className="num">{formatNumber(proxy.demandProxy)}</div>
      <div className="spark" aria-hidden>
        <span style={{ width }} />
      </div>
      <div className="muted">
        {proxy.inCatalog}/{proxy.organicCount} in catalog
      </div>
    </div>
  );
}
