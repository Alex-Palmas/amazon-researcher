# Amazon Researcher

Roore-first Amazon seller OS for pickleball accessories. Dark Jungle Scout energy, not a generic clone. Data is the 29 Aug 2026 PT scrape — no invented ASINs, prices, FOBs, ranks, or search volumes.

## Local

```bash
npm i && npm run dev
```

Vite `base` is `/amazon-researcher/`. Hash routes:

| Route | Page | What it does |
| --- | --- | --- |
| `#overview` | Overview | Roore + research KPIs, alert rail, scrape stamp |
| `#research` | Research | Opportunity finder, plays after 15% TACOS, trending, filters |
| `#mine` | My listings | Four Roore SKUs, 292 / 4.31, parent pool, title coverage |
| `#competitors` | Competitors | Tape and carry clusters from the catalog |
| `#keywords` | Keywords | Tracker, competitor organic ranks, demand proxy (catalog units, not search volume), listing-copy reverse ASIN |
| `#studio` | Studio | Listing optimizer, default B0GDC2M73C |
| `#profit` | Profit lab | Fee-stack calculator from scrape assumptions |
| `#sourcing` | Sourcing | Sourced SKUs with Alibaba text |
| `#track` | Track | Watchlist over listings.json |
| `#settings` | Settings | Edit / reset fee assumptions |

Command palette: ⌘K / Ctrl+K searches ASIN, title, or brand.

## Live

https://alex-palmas.github.io/amazon-researcher/

Monthly profit in the scrape is 100% of that listing’s bought-past-month units, not a forecast. After ads = minus 15% TACOS.
