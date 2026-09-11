import { useEffect, useMemo, useState } from "react";
import { Kpi } from "../components/Kpi";
import { ProductThumb } from "../components/ProductThumb";
import { blueprintsForMine } from "../lib/ppcBlueprint";
import { classifyAll, type ClassifiedTerm } from "../lib/ppcClassify";
import { isAutoLike, isBroadLike, parseSearchTermReport } from "../lib/ppcCsv";
import { formatMoney, formatNumber, formatPct } from "../lib/format";
import type { usePpc } from "../hooks/usePpc";
import type {
  HarvestQueueItem,
  Listing,
  PpcSettings,
  PpcTag,
} from "../types";

type PpcHook = ReturnType<typeof usePpc>;
type TermFilter = "all" | PpcTag | "sample";

interface Props extends PpcHook {
  listings: Listing[];
}

const TAG_LABEL: Record<PpcTag, string> = {
  harvest_exact: "HARVEST EXACT",
  phrase_expand: "WATCH / PHRASE",
  negate: "NEGATE",
  watch: "WATCH",
  ignore: "IGNORE",
};

const TAG_CLASS: Record<PpcTag, string> = {
  harvest_exact: "harvest",
  phrase_expand: "expand",
  negate: "negate",
  watch: "watch",
  ignore: "ignore",
};

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function stamp(): string {
  return new Date().toISOString();
}

export function Ppc({
  listings,
  ready,
  seed,
  settings,
  harvestQueue,
  negateQueue,
  importedSearchTerms,
  lastImportMeta,
  dismissedIds,
  saveSettings,
  resetSettings,
  importTerms,
  addHarvest,
  addNegate,
  removeHarvest,
  removeNegate,
  dismissTerm,
  resetLocal,
}: Props) {
  const [draft, setDraft] = useState<PpcSettings>(settings);
  const [filter, setFilter] = useState<TermFilter>("all");
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const classified = useMemo(
    () => classifyAll(importedSearchTerms, settings, listings),
    [importedSearchTerms, settings, listings],
  );
  const blueprints = useMemo(
    () => blueprintsForMine(listings, seed.blueprints),
    [listings, seed.blueprints],
  );

  const live = classified.filter((row) => !row.example);
  const sample = classified.filter((row) => row.example);
  const liveCounts = useMemo(() => {
    const counts: Record<PpcTag, number> = {
      harvest_exact: 0,
      phrase_expand: 0,
      negate: 0,
      watch: 0,
      ignore: 0,
    };
    for (const row of live) {
      if (dismissedIds.includes(row.id)) continue;
      counts[row.tag] += 1;
    }
    return counts;
  }, [live, dismissedIds]);

  const shown = classified.filter((row) => {
    if (filter === "sample") return row.example;
    if (filter !== "all" && row.tag !== filter) return false;
    if (dismissedIds.includes(row.id) && filter === "all") return false;
    return true;
  });

  const onCopy = async (key: string, text: string) => {
    const ok = await copyText(text);
    setCopied(ok ? key : "failed");
    window.setTimeout(() => setCopied(null), 1800);
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    setImportError(null);
    try {
      const text = await file.text();
      const rows = parseSearchTermReport(text);
      if (rows.length === 0) {
        throw new Error("No search-term rows found. Check that this is a Sponsored Products Search Term Report.");
      }
      importTerms(rows, {
        fileName: file.name,
        importedAt: stamp(),
        rowCount: rows.length,
      });
      setFilter("all");
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Could not parse CSV");
    }
  };

  const queueHarvest = (row: ClassifiedTerm, destination: HarvestQueueItem["destination"]) => {
    const item: HarvestQueueItem = {
      id: `h-${destination}-${row.id}`,
      searchTerm: row.searchTerm,
      destination,
      asin: row.matchedAsin,
      sourceCampaign: row.campaignName,
      addedAt: stamp(),
      example: row.example,
    };
    addHarvest(item);
    if (destination !== "exact") return;
    const auto = isAutoLike(row.matchType, row.campaignName);
    const broad = isBroadLike(row.matchType, row.campaignName);
    addNegate({
      id: `n-loop-${row.id}`,
      searchTerm: row.searchTerm,
      negativeType: "exact",
      applyTo: auto && broad ? "auto_and_broad" : broad ? "broad" : "auto",
      asin: row.matchedAsin,
      sourceCampaign: row.campaignName,
      reason: "Harvested Exact — also negative exact on source Auto (and Broad if present)",
      addedAt: stamp(),
      example: row.example,
    });
  };

  const queueNegate = (row: ClassifiedTerm) => {
    addNegate({
      id: `n-${row.id}`,
      searchTerm: row.searchTerm,
      negativeType: row.negativeType ?? "exact",
      applyTo: row.applyTo ?? "auto",
      asin: row.matchedAsin,
      sourceCampaign: row.campaignName,
      reason: row.reasons.join(" · "),
      addedAt: stamp(),
      example: row.example,
    });
  };

  const harvestPaste = harvestQueue
    .filter((row) => row.destination === "exact")
    .map((row) => row.searchTerm)
    .join("\n");
  const phrasePaste = harvestQueue
    .filter((row) => row.destination === "phrase")
    .map((row) => row.searchTerm)
    .join("\n");
  const negateExactPaste = negateQueue
    .filter((row) => row.negativeType === "exact")
    .map((row) => row.searchTerm)
    .join("\n");
  const negatePhrasePaste = negateQueue
    .filter((row) => row.negativeType === "phrase")
    .map((row) => row.searchTerm)
    .join("\n");

  const liveHarvestQueued = harvestQueue.filter((row) => !row.example).length;
  const liveNegateQueued = negateQueue.filter((row) => !row.example).length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>PPC</h1>
          <p className="lede">
            Auto discover → Exact harvest → Negative exact back on Auto. Keep Auto on forever. This page has no Amazon
            Ads API — upload a Search Term Report CSV. Seed rows are marked Sample, not live Roore Ads data.
          </p>
        </div>
      </div>

      <div className="strategy-strip">
        <article className="card strategy-step">
          <div className="step-num">1 · Discover</div>
          <strong>SP Auto stays on</strong>
          <p>
            Close / loose / complements / substitutes are the discovery engine. Do not turn Auto off after harvest.
            Bids stay lower than Exact.
          </p>
        </article>
        <article className="card strategy-step">
          <div className="step-num">2 · Harvest</div>
          <strong>Winners → Manual Exact</strong>
          <p>
            ≥2 orders and ACoS ≤ target ({settings.targetAcosPct}%). One ASIN (or tight family) per ad group. Exact
            bids highest / controlled. Near-winners go to Phrase expand, not Exact.
          </p>
        </article>
        <article className="card strategy-step">
          <div className="step-num">3 · Close the loop</div>
          <strong>Negate on Auto</strong>
          <p>
            Every harvested Exact is also Negative Exact on the source Auto (and Broad if present). Prefer negative
            exact; negative phrase only for used / rental / wrong sport.
          </p>
        </article>
      </div>

      <div className="kpis">
        <Kpi
          label="Imported live rows"
          value={ready ? live.length : "…"}
          sub={
            lastImportMeta
              ? `${lastImportMeta.fileName} · ${lastImportMeta.rowCount} parsed`
              : "No CSV uploaded yet"
          }
        />
        <Kpi
          label="Harvest Exact candidates"
          value={liveCounts.harvest_exact}
          sub="live rows only · Sample excluded"
        />
        <Kpi label="Negate candidates" value={liveCounts.negate} sub="live rows only · Sample excluded" />
        <Kpi
          label="Sample rows"
          value={sample.length}
          sub="EXAMPLE / Sample — never treated as live Ads KPIs"
        />
      </div>
      {live.length === 0 && (
        <p className="note">
          No live Search Term Report loaded. Any spend / ACoS / orders you see below are Sample rows for the classifier
          demo — not Roore Ads performance.
        </p>
      )}

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Thresholds</h2>
            <p className="lede">
              Saved in localStorage. Lookback is the weekly STR window to download (prefer last 14–30 days).
            </p>
          </div>
        </div>
        <div className="calc-grid">
          <label>
            Target ACoS %
            <input
              type="number"
              min={1}
              max={100}
              step={1}
              value={draft.targetAcosPct}
              onChange={(event) => setDraft({ ...draft, targetAcosPct: Number(event.target.value) })}
            />
          </label>
          <label>
            Negate spend multiplier
            <input
              type="number"
              min={1}
              max={5}
              step={0.1}
              value={draft.negateSpendMultiplier}
              onChange={(event) => setDraft({ ...draft, negateSpendMultiplier: Number(event.target.value) })}
            />
          </label>
          <label>
            Negate clicks (0 orders)
            <input
              type="number"
              min={1}
              step={1}
              value={draft.negateClicksZeroOrders}
              onChange={(event) => setDraft({ ...draft, negateClicksZeroOrders: Number(event.target.value) })}
            />
          </label>
          <label>
            STR lookback days
            <input
              type="number"
              min={7}
              max={30}
              step={1}
              value={draft.lookbackDays}
              onChange={(event) => setDraft({ ...draft, lookbackDays: Number(event.target.value) })}
            />
          </label>
        </div>
        <p className="note">
          Negate 0-order terms when spend ≥ multiplier × break-even CPA (catalog unit profit if positive; otherwise
          listing price × target ACoS). If CPA is unknown, the clicks threshold is the secondary rule. Default
          multiplier 2, default clicks 15.
        </p>
        <div className="form-row">
          <button
            className="btn"
            type="button"
            onClick={() => {
              saveSettings(draft);
              setSavedAt(new Date().toLocaleTimeString());
            }}
          >
            Save thresholds
          </button>
          <button
            className="btn ghost"
            type="button"
            onClick={() => {
              resetSettings();
              setSavedAt("reset");
            }}
          >
            Reset defaults
          </button>
          <button className="btn ghost" type="button" onClick={resetLocal}>
            Clear local PPC data
          </button>
          {savedAt && <span className="muted">{savedAt === "reset" ? "Defaults restored" : `Saved ${savedAt}`}</span>}
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Campaign blueprint</h2>
        <p className="lede">
          Suggested names for each mine ASIN. Exact bids highest / controlled; Auto discovery bids lower. Keep Auto
          running.
        </p>
        <div className="blueprint-grid">
          {blueprints.map((bp) => (
            <article key={bp.asin} className="card blueprint-card">
              <div className="product-card" style={{ padding: 0, cursor: "default" }}>
                <ProductThumb listing={bp.listing} />
                <div>
                  <p className="asin">{bp.asin}</p>
                  <p className="product-title">{bp.listing.title}</p>
                </div>
              </div>
              <ul className="blueprint-list">
                <li>
                  <span>SP Auto – Discovery</span>
                  <code>{bp.auto}</code>
                </li>
                <li>
                  <span>SP Manual Exact – Harvest</span>
                  <code>{bp.exact}</code>
                </li>
                <li>
                  <span>SP Manual Phrase – Expansion</span>
                  <code>{bp.phrase}</code>
                </li>
                <li>
                  <span>Negatives</span>
                  <code>Negative Exact on {bp.auto}</code>
                </li>
              </ul>
              <p className="muted">{bp.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2 className="section-title">Import Search Term Report</h2>
            <p className="lede">
              Amazon Ads → Sponsored Products → Search term report. Prefer last {settings.lookbackDays} days (14–30).
              Flexible headers: Customer Search Term / Search Term, Spend/Cost, 7/14 Day Sales & Orders, ACoS,
              Campaign Name, Match Type, ASIN.
            </p>
          </div>
        </div>
        <div className="form-row">
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            onChange={(event) => {
              const file = event.target.files?.[0];
              void onFile(file);
              event.target.value = "";
            }}
          />
        </div>
        {lastImportMeta && (
          <p className="note">
            Last import: {lastImportMeta.fileName} · {lastImportMeta.rowCount} rows · {lastImportMeta.importedAt}
          </p>
        )}
        {importError && <p className="note neg">{importError}</p>}

        <div className="chip-row" style={{ marginTop: 12 }}>
          {(
            [
              ["all", "All"],
              ["harvest_exact", "Harvest"],
              ["phrase_expand", "Phrase / watch"],
              ["negate", "Negate"],
              ["watch", "Watch"],
              ["sample", "Sample"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`chip ${filter === id ? "active" : ""}`}
              onClick={() => setFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Search term</th>
                <th>Tag</th>
                <th>Orders</th>
                <th>ACoS</th>
                <th>Spend</th>
                <th>Clicks</th>
                <th>Campaign</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((row) => (
                <tr key={row.id}>
                  <td>
                    <strong>{row.searchTerm}</strong>
                    <div className="badge-row">
                      {row.example && <span className="badge sample">SAMPLE</span>}
                      {row.matchedAsin && <span className="badge watch">{row.matchedAsin}</span>}
                      {dismissedIds.includes(row.id) && <span className="badge miss">DISMISSED</span>}
                    </div>
                    <div className="muted">{row.reasons.join(" · ")}</div>
                  </td>
                  <td>
                    <span className={`badge ${TAG_CLASS[row.tag]}`}>{TAG_LABEL[row.tag]}</span>
                    {row.tag === "negate" && row.negativeType && (
                      <div className="muted">negative {row.negativeType}</div>
                    )}
                  </td>
                  <td className="num">{formatNumber(row.orders)}</td>
                  <td className="num">{formatPct(row.acosUsed, true)}</td>
                  <td className="num">{formatMoney(row.spend)}</td>
                  <td className="num">{formatNumber(row.clicks)}</td>
                  <td>
                    {row.campaignName ?? "—"}
                    <div className="muted">{row.matchType ?? ""}</div>
                  </td>
                  <td>
                    <div className="form-row" style={{ margin: 0 }}>
                      <button className="btn" type="button" onClick={() => queueHarvest(row, "exact")}>
                        Add to Exact harvest
                      </button>
                      {row.tag === "phrase_expand" && (
                        <button className="btn ghost" type="button" onClick={() => queueHarvest(row, "phrase")}>
                          Queue Phrase expand
                        </button>
                      )}
                      <button className="btn ghost" type="button" onClick={() => queueNegate(row)}>
                        Add to Negate
                      </button>
                      <button className="btn danger" type="button" onClick={() => dismissTerm(row.id)}>
                        Dismiss
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {shown.length === 0 && (
                <tr>
                  <td colSpan={8} className="muted">
                    No rows in this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Queues</h2>
        <p className="lede">
          Paste into Amazon Ads console. Harvest Exact also queues Negative Exact on Auto so you do not pay twice.
          Live queued: {liveHarvestQueued} harvest · {liveNegateQueued} negate.
        </p>
        <div className="ppc-queues">
          <article className="card queue-panel">
            <div className="section-head">
              <h3 className="mini-title">Exact harvest queue</h3>
              <button
                className="btn ghost"
                type="button"
                onClick={() => onCopy("exact", harvestPaste)}
                disabled={!harvestPaste}
              >
                {copied === "exact" ? "Copied" : "Copy Exact list"}
              </button>
            </div>
            {phrasePaste && (
              <div className="form-row">
                <button className="btn ghost" type="button" onClick={() => onCopy("phrase", phrasePaste)}>
                  {copied === "phrase" ? "Copied" : "Copy Phrase expand list"}
                </button>
              </div>
            )}
            {harvestQueue.length === 0 ? (
              <p className="muted">Empty. Add harvest candidates from the table.</p>
            ) : (
              <ul className="queue-list">
                {harvestQueue.map((row) => (
                  <li key={row.id}>
                    <div>
                      <strong>{row.searchTerm}</strong>
                      <div className="muted">
                        {row.destination} · {row.asin ?? "no ASIN"} · {row.sourceCampaign ?? "campaign n/a"}
                        {row.example ? " · SAMPLE" : ""}
                      </div>
                    </div>
                    <button className="btn danger" type="button" onClick={() => removeHarvest(row.id)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </article>
          <article className="card queue-panel">
            <div className="section-head">
              <h3 className="mini-title">Negate queue</h3>
              <div className="form-row" style={{ margin: 0 }}>
                <button
                  className="btn ghost"
                  type="button"
                  onClick={() => onCopy("neg-exact", negateExactPaste)}
                  disabled={!negateExactPaste}
                >
                  {copied === "neg-exact" ? "Copied" : "Copy negative Exact"}
                </button>
                <button
                  className="btn ghost"
                  type="button"
                  onClick={() => onCopy("neg-phrase", negatePhrasePaste)}
                  disabled={!negatePhrasePaste}
                >
                  {copied === "neg-phrase" ? "Copied" : "Copy negative Phrase"}
                </button>
              </div>
            </div>
            {negateQueue.length === 0 ? (
              <p className="muted">Empty. Harvest auto-adds Negative Exact on Auto; spenders can be added manually.</p>
            ) : (
              <ul className="queue-list">
                {negateQueue.map((row) => (
                  <li key={row.id}>
                    <div>
                      <strong>{row.searchTerm}</strong>
                      <div className="muted">
                        negative {row.negativeType} · {row.applyTo.replaceAll("_", " ")} · {row.reason}
                        {row.example ? " · SAMPLE" : ""}
                      </div>
                    </div>
                    <button className="btn danger" type="button" onClick={() => removeNegate(row.id)}>
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
        {copied === "failed" && <p className="note neg">Clipboard copy failed in this browser.</p>}
      </section>

      <section className="section">
        <h2 className="section-title">Weekly ops checklist</h2>
        <ol className="checklist">
          <li>Download Sponsored Products Search Term Report for the last {settings.lookbackDays} days (14–30).</li>
          <li>Upload the CSV here. Classifier tags harvest / phrase expand / negate / watch.</li>
          <li>Add Exact harvest candidates and Negate spenders in the same session.</li>
          <li>Paste Exact keywords into `Roore | … | Exact`. Paste Negative Exact onto `Roore | … | Auto`.</li>
          <li>Leave Auto campaigns running — they are the discovery engine, not a temporary launch tactic.</li>
        </ol>
        <p className="note">
          Bid posture: Exact highest / controlled. Auto lower. One ASIN or tight ASIN family per ad group. No live Ads
          spend, ACoS, or orders are stored in this repo.
        </p>
      </section>
    </div>
  );
}
