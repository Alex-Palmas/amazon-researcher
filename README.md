# Amazon Researcher

Roore-first Amazon seller OS for pickleball accessories. Dark Jungle Scout energy, not a generic clone. Data is the 29 Aug 2026 PT scrape — no invented ASINs, prices, FOBs, ranks, or search volumes.

## Local

```bash
npm i && npm run dev
```

Vite `base` is `/amazon-researcher/`. Hash routes:

| Route | Page | What it does |
| --- | --- | --- |
| `#overview` | Overview | Roore + research KPIs, Amazon chart counts, New Releases rail, alerts rail, scrape stamp |
| `#alerts` | Alerts | Weekly alerts from `alerts.json` (info / watch / warn), photo-first when the ASIN is in the catalog |
| `#research` | Research | Chart chips (Accessories / Best Sellers / New Releases / All), plays after 15% TACOS, trending, filters |
| `#mine` | My listings | Four Roore SKUs, 292 / 4.31, parent pool, title coverage |
| `#competitors` | Competitors | Tape and carry clusters from the catalog |
| `#keywords` | Keywords | Tracker, competitor organic ranks, demand proxy (catalog units, not search volume), listing-copy reverse ASIN |
| `#studio` | Studio | Listing optimizer, default B0GDC2M73C |
| `#profit` | Profit lab | Fee-stack calculator from scrape assumptions |
| `#sourcing` | Sourcing | Sourced SKUs with Alibaba text |
| `#history` | History | Weekly snapshots from `history.json`: Roore four SKUs, “tungsten pickleball tape” top 10, New Release tape/weights. Δ is “next Monday” until a second week exists, then real week-over-week. |
| `#track` | Track | Watchlist over listings.json |
| `#settings` | Settings | Edit / reset fee assumptions |

Command palette: ⌘K / Ctrl+K searches ASIN, title, or brand.

## Live

https://alex-palmas.github.io/amazon-researcher/

Optional listing fields `lists`, `bestsellerRank`, and `newReleaseRank` power two extra Amazon charts on Pickleball Accessories node `213609101011` (not Equipment `13287931`). Existing `rank` stays the 10-page accessories popularity catalog. BESTSELLER / NEW RELEASE badges appear when an ASIN is on that chart. Paddle sets stay profit-excluded from plays but may appear on Best Sellers / New Releases ranking views.

`history.json` and `alerts.json` load next to `listings.json`. A 404 leaves History / Alerts empty — the app does not crash. First snapshot is 29 Aug 2026 PT; week-over-week deltas wait for the next Monday scrape.

Monthly profit in the scrape is 100% of that listing’s bought-past-month units, not a forecast. After ads = minus 15% TACOS.
