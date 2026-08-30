import { ProductThumb } from "../components/ProductThumb";
import { Kpi } from "../components/Kpi";
import { formatMoney, formatNumber } from "../lib/format";
import {
  TUNGSTEN_SERP_PHRASE,
  canSpark,
  deltaLabel,
  isRooreAsin,
  keywordSlots,
  latestSnapshot,
  previousSnapshot,
  rooreOf,
} from "../lib/weekly";
import { MINE_ASINS, type HistoryFile, type Listing } from "../types";

interface Props {
  file: HistoryFile | null;
  ready: boolean;
  listings: Listing[];
  onOpen: (listing: Listing) => void;
}

export function History({ file, ready, listings, onOpen }: Props) {
  const snapshot = latestSnapshot(file);
  const prior = previousSnapshot(file);
  const hasPriorWeek = Boolean(prior);
  const sparkOk = canSpark(file);
  const byAsin = new Map(listings.map((row) => [row.asin, row]));
  const serp = snapshot?.serpTop10[TUNGSTEN_SERP_PHRASE] ?? [];
  const tape = snapshot?.newReleaseTape ?? [];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>History</h1>
          <p className="lede">
            Weekly snapshot. First week is {snapshot?.date ?? "—"} {snapshot?.timezone ?? "PT"}. No prior week, so no
            fake deltas.
          </p>
        </div>
      </div>

      {!ready ? (
        <p className="note">Loading history…</p>
      ) : !snapshot ? (
        <p className="note">history.json is missing. Nothing invented.</p>
      ) : (
        <>
          <div className="kpis">
            <Kpi label="Snapshot" value={snapshot.date} sub={`${snapshot.timezone} · ${snapshot.source}`} />
            <Kpi label="Catalog rows" value={snapshot.counts.listings} sub={`${snapshot.counts.bestsellers} Best Sellers`} />
            <Kpi label="New Releases" value={snapshot.counts.newReleases} sub="accessories chart" />
            <Kpi
              label="Catalog reviews"
              value={formatNumber(snapshot.counts.catalogReviews)}
              sub={`weighted ${snapshot.counts.weightedRating.toFixed(2)}`}
            />
          </div>
          <p className="note">
            Delta column stays &quot;next Monday&quot; until a second snapshot lands. Sparklines only appear with two or
            more weeks. No invented search volume.
          </p>

          <section className="section">
            <div className="section-head">
              <div>
                <h2 className="section-title">Roore this week</h2>
                <p className="lede">
                  Reviews, rating, price, units, Best Seller rank, keyword slots. B0GDC2M73C is Best Seller #42.
                  B0DJ5M2MMW is not on Best Sellers.
                </p>
              </div>
            </div>
            <div className="table-wrap">
              <table className="table static">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Reviews</th>
                    <th>Rating</th>
                    <th>Price</th>
                    <th>Units</th>
                    <th>Best Seller</th>
                    <th>Keyword slots</th>
                    <th>Δ</th>
                    {sparkOk && <th>Trend</th>}
                  </tr>
                </thead>
                <tbody>
                  {MINE_ASINS.map((asin) => {
                    const row = rooreOf(snapshot, asin);
                    const listing = byAsin.get(asin);
                    const prev = prior ? rooreOf(prior, asin) : undefined;
                    if (!row) {
                      return (
                        <tr key={asin}>
                          <td colSpan={sparkOk ? 9 : 8}>{asin} missing from this snapshot</td>
                        </tr>
                      );
                    }
                    const slots = keywordSlots(row);
                    return (
                      <tr
                        key={asin}
                        className="mine-row"
                        onClick={() => listing && onOpen(listing)}
                      >
                        <td>
                          <div className="product-cell">
                            {listing ? (
                              <ProductThumb listing={listing} />
                            ) : (
                              <img className="thumb" src={row.image} alt={row.title} width={48} height={48} />
                            )}
                            <div>
                              <div className="product-title">{row.title}</div>
                              <div className="asin">{row.asin}</div>
                            </div>
                          </div>
                        </td>
                        <td className="num">{formatNumber(row.reviews)}</td>
                        <td className="num">{row.rating == null ? "—" : row.rating.toFixed(1)}</td>
                        <td className="num">{formatMoney(row.price)}</td>
                        <td className="num">{formatNumber(row.units)}</td>
                        <td className="num">{formatNumber(row.bestsellerRank)}</td>
                        <td>
                          {slots.length === 0 ? (
                            <span className="muted">not in checked SERP top 10</span>
                          ) : (
                            <ul className="slot-list">
                              {slots.map((slot) => (
                                <li key={slot.phrase}>
                                  #{slot.rank} {slot.phrase}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td className="muted">{deltaLabel(row.reviews, prev?.reviews, hasPriorWeek)}</td>
                        {sparkOk && (
                          <td>
                            <Sparkline
                              values={(file?.snapshots ?? []).map(
                                (snap) => rooreOf(snap, asin)?.reviews ?? null,
                              )}
                            />
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section">
            <div className="section-head">
              <div>
                <h2 className="section-title">“{TUNGSTEN_SERP_PHRASE}” top 10</h2>
                <p className="lede">
                  This week from serpTop10. Roore rows highlighted — strips #4, 1 g/in tape #10. B0GDC2M73C is also
                  organic #1 for “tungsten tape strips pickleball”.
                </p>
              </div>
            </div>
            <div className="table-wrap">
              <table className="table static">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Product</th>
                    <th>ASIN</th>
                  </tr>
                </thead>
                <tbody>
                  {serp.map((hit) => {
                    const listing = byAsin.get(hit.asin);
                    return (
                      <tr
                        key={`${hit.position}-${hit.asin}`}
                        className={isRooreAsin(hit.asin) ? "mine-row" : undefined}
                        onClick={() => listing && onOpen(listing)}
                      >
                        <td className="num">{hit.position}</td>
                        <td>
                          <div className="product-cell">
                            {listing && <ProductThumb listing={listing} />}
                            <div className="product-title">{hit.title}</div>
                          </div>
                        </td>
                        <td className="asin">{hit.asin}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section">
            <div className="section-head">
              <div>
                <h2 className="section-title">New Release tape / weights</h2>
                <p className="lede">
                  newReleaseTape this week. #1 is B0H1BMN3T9. No extra ranks invented.
                </p>
              </div>
            </div>
            <div className="table-wrap">
              <table className="table static">
                <thead>
                  <tr>
                    <th>NR</th>
                    <th>Product</th>
                    <th>Reviews</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {tape.map((row) => {
                    const listing = byAsin.get(row.asin);
                    return (
                      <tr key={row.asin} onClick={() => listing && onOpen(listing)}>
                        <td className="num">{formatNumber(row.newReleaseRank)}</td>
                        <td>
                          <div className="product-cell">
                            {listing ? (
                              <ProductThumb listing={listing} />
                            ) : (
                              <img className="thumb" src={row.image} alt={row.title} width={48} height={48} />
                            )}
                            <div>
                              <div className="product-title">{row.title}</div>
                              <div className="asin">{row.asin}</div>
                            </div>
                          </div>
                        </td>
                        <td className="num">{formatNumber(row.reviews)}</td>
                        <td className="num">{typeof row.price === "number" ? formatMoney(row.price) : row.price ?? "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function Sparkline({ values }: { values: (number | null)[] }) {
  const nums = values.filter((value): value is number => value != null);
  if (values.length < 2 || nums.length < 2) return <span className="muted">—</span>;
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || 1;
  const w = 72;
  const h = 22;
  const pts = nums
    .map((value, index) => {
      const x = (index / (nums.length - 1)) * w;
      const y = h - ((value - min) / span) * (h - 2) - 1;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg className="sparkline" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={pts} />
    </svg>
  );
}
