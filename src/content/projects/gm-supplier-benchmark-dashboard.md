---
title: "GM Supplier Benchmark Dashboard"
tagline: "Five-year financial trends for 200+ GM suppliers from SEC and Yahoo Finance data"
description: "A supplier financial benchmarking dashboard for General Motors' purchasing team: revenue, SG&A, and EBIT for more than 200 automotive suppliers, with a five-year trends page fed by a SEC and Yahoo Finance pipeline."
problem: "GM's purchasing organisation negotiates with suppliers whose public financials are scattered across SEC filings and finance portals. Comparing a supplier's SG&A and EBIT margins against its peers, or seeing how they moved over five years, meant pulling numbers by hand for every negotiation."
solution: "Built a CSV-backed Flask dashboard with a supplier explorer, company compare, map, parts index, and a historical trends page. I built the trends page and its five-year data pipeline: yfinance history extraction for every verified ticker, a trends payload builder, three new API endpoints, sparklines on the supplier list, and Plotly charts for supplier trends, portfolio composition, margins, waterfall, and heatmap."
demoUrl: "https://gm-mecg.vercel.app"
githubUrl: "https://github.com/RahilBhavan/gm_mecg"
kind: "consulting"
featured: false
completedDate: 2026-04-24
---
## Overview

**What it is:** A multi-page analytics dashboard for supplier financial review, built for General Motors through the Michigan Engineering Consulting Group (MECG). It covers a home dashboard, supplier explorer, company compare, historical trends, supplier map, parts index, add-company workflow, and a data refresh page that pulls current financials from Yahoo Finance. A companion repository, `gm_mecg`, exports automotive supply chain quarterly financials from SEC and Yahoo Finance data to Excel.

**Why it matters:** Supplier negotiations go better with the supplier's own numbers on the table. Revenue, SG&A, and EBIT, and the SG&A and EBIT percentages derived from them, tell a buyer how much room a supplier has. The dashboard puts those figures for more than 200 suppliers in one place and shows five years of trend.

**Who it's for:** GM's PPCO team, which used it for supplier negotiations, and the MECG consulting team maintaining it.

**Impact:** Used by GM's PPCO team for supplier negotiations. My main contribution was the historical trends page and its five-year data pipeline, merged as PR #3 in the client repository (+5,597 lines).

## The Problem

### The Challenge

Supplier financials are public but not convenient. Each negotiation prep meant looking up a supplier's filings, computing margins, and finding peers to compare against.

**Specific issues:**
- Financial data spread across SEC filings and finance portals
- No consistent margin computation across suppliers
- No view of how a supplier's margins moved over time
- Supplier names do not map cleanly to tickers; private companies have no public financials at all

**Who was affected:**
- GM purchasing staff preparing for negotiations
- The consulting team maintaining the dataset

### Constraints & Requirements

**Technical constraints:**
- CSV-backed by design, so a client can clone the repository and see the same initialised dataset immediately
- Python 3.11 recommended; the scraper pipeline is most reliable there
- Local dashboard runs without internet; refreshes, FX rates, geocoding, and CDN assets need it

**Data constraints:**
- Ticker resolution must be verified to avoid misaligned revenue rows
- Manual public/private overrides where automatic classification is wrong

## The Solution

### Approach & Methodology

Keep the data as checked-in CSVs, build every page from a JSON payload computed by `data_processor.py`, and refresh financials through a pipeline that resolves tickers, fetches from Yahoo Finance, and writes back to CSV.

For the trends work specifically:
1. Extract five years of annual Revenue, SG&A, and EBIT for every supplier with a verified ticker
2. Write a long-format `supplier_history.csv` with margins and year-over-year changes
3. Build `trends_data.json` with per-supplier year data, portfolio aggregates, and a sparkline lookup
4. Serve it through three endpoints and render it with Plotly

### Technology Stack

**Backend:**
- Flask server with page routes and JSON APIs
- pandas for payload building
- yfinance for financial refresh, requests and BeautifulSoup for scraping, Selenium for the scraper path
- openpyxl for Excel export

**Frontend:**
- One HTML and JS pair per page (`index`, `explorer`, `compare`, `trends`, `map`, `parts`, `add_company`, `webscraper`)
- Plotly for charts, Leaflet for the map, Simple DataTables for tables
- Full dark mode support

**Data:**
- `companies_master.csv`, `auto_suppliers-scraped.csv`, `ticker_map.csv`, `supplier_locations.csv`, `supplier_history.csv`, `trends_data.json`, `public_company_overrides.csv`

**Why this stack:**
- Flask and CSVs are simple enough for a client to run from a fresh clone
- Plotly gives interactive charts without a frontend build step

### Architecture & Design Decisions

**Verified tickers only.** The history pipeline uses tickers already verified in the scraped CSV, which avoids the misaligned Yahoo revenue rows that had to be scrubbed earlier in the project.

**Prebuilt trends cache.** `trends_data.json` is rebuilt when the scraper job succeeds, so the trends page loads from a cache rather than recomputing from the long-format CSV on every request.

**Port 8080.** Port 5000 conflicts with AirPlay Receiver on macOS, so the app defaults to 8080.

**Trade-offs:**
- CSV storage is easy to inspect and hand-correct but has no transactions
- Yahoo Finance history is convenient but incomplete for some suppliers, and private companies have none

### Key Features

1. **Supplier explorer and company compare** with parts filtering
2. **Historical trends page**: supplier trends, portfolio composition, margin analysis, waterfall, heatmap, and a sortable data table with sparklines
3. **Supplier map** with geocoded headquarters
4. **Parts index** from normalised product and category metadata
5. **Add company** by manual entry, CSV import, or comma-separated name, ticker, and DUNS
6. **Priority or full data refresh** from the UI or the command line

## Technical Highlights

### The five-year history pipeline

```python
def fetch_supplier_history(
    all_names: list[str], scraped_csv: Path, output_path: Path,
    min_year: int = 2021, max_year: int = 2025,
) -> None:
    """Fetch annual financials for all suppliers, write supplier_history.csv.
    Uses verified tickers from the scraped CSV to avoid misalignment."""
    verified = _used_tickers_from_csv(scraped_csv)
    if not verified:
        print("No verified tickers; skipping history.")
        return
```

`supplier_history.csv` is long-format, one row per company per year:

```text
Company Name,Ticker,Year,Revenue (USD),SG&A (USD),EBIT (USD),SG&A %,EBIT %,SG&A+EBIT %,Revenue YoY %,SG&A YoY %,EBIT YoY %,Source
```

### The trends payload

```python
def build_trends_payload(
    history_csv: str | Path,
    scraped_csv: str | Path | None = None,
    cache_path: str | Path | None = None,
):
    """Build trends JSON from supplier_history.csv for the /trends page.

    Reads the long-format history CSV, computes per-supplier year data,
    portfolio aggregates (total revenue, health counts, concentration),
    and a trend lookup for sparklines. Writes to trends_data.json.
    """
```

**Key Technical Decisions:**

1. **Three endpoints, one payload.** `/api/trends/suppliers`, `/api/trends/aggregates`, and `/api/trends/compare` all read the cached payload.
2. **Sparklines on the existing supplier list.** `/api/suppliers` was extended with trend data so the explorer shows direction without opening the trends page.
3. **Rebuild on scraper success.** The trends cache is hooked into the scraper job so it never lags the underlying data.

## Process & Timeline

### Phase 1: Dashboard baseline (before April 2026)

- Flask app, supplier explorer, scraper pipeline, ticker map, and company input flow
- Company compare workspace and shared theming

### Phase 2: Map, API optimisation, parts index, and trends (April 2026)

- World map, optimised API pipeline, and parts index
- Historical trends page with the five-year financial data pipeline
- Company compare parts filtering

### Phase 3: Client handoff (April 24, 2026)

- Feature branch merged, baseline prepared for handoff, non-automotive companies removed from the initialised dataset

## Challenges & Solutions

### Challenge 1: Misaligned financials from name-to-ticker lookups

**The Problem:** Resolving supplier names to tickers automatically produced some wrong matches, and the wrong company's revenue landed in the dataset.

**The Solution:** Tightened Yahoo fallback ticker validation, scrubbed the stale rows, and built the history pipeline on verified tickers only.

**What I learned:** In a benchmarking tool, a wrong number is worse than a missing one.

### Challenge 2: Five years of data for 200+ suppliers without slowing the page

**The Problem:** Recomputing per-supplier trends, portfolio aggregates, and sparklines on every request would make the trends page slow.

**The Solution:** A prebuilt `trends_data.json` cache regenerated when the scraper job succeeds.

**What I learned:** Precompute what the page needs and serve the file.

## Results & Metrics

- 225 suppliers with five years of annual history (2021 to 2025) in `supplier_history.csv`, 952 supplier-year rows
- Revenue, SG&A, EBIT, and derived SG&A %, EBIT %, SG&A+EBIT %, and year-over-year changes per row
- Trends PR: +5,597 lines merged as PR #3 in the client repository
- Used by GM's PPCO team for supplier negotiations

## Learnings

### What Worked Well

- CSV-backed data that a client can inspect and correct by hand
- A single payload builder per page, so the frontend stays thin
- Keeping ticker verification upstream of every downstream number

### What Didn't Work

- Automatic name-to-ticker resolution without validation
- Relying on CDN assets means the map and trends pages need internet even for local runs

### What I'd Do Differently

- Add a validation report that flags suppliers whose revenue changed by an implausible amount between refreshes
- Move quarterly data into the dashboard rather than keeping it in the separate Excel export

## Links & Resources

- **Live dashboard**: [gm-mecg.vercel.app](https://gm-mecg.vercel.app)
- **Repository**: [github.com/RahilBhavan/gm_mecg](https://github.com/RahilBhavan/gm_mecg)

---

**Completed:** April 24, 2026
