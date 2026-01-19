# Books Aggregation System

This system aggregates book data from multiple sources (Goodreads, Audible, Spotify, manual entries) and creates a unified view, following the architecture described in [Ajay Misra's pseudocode post](https://www.ajaymisra.com/posts/psuedocode).

Based on Ajay's actual implementation:
- [vision-books.py](https://github.com/ajaymisraa/personal-website-features/blob/main/vision-books.py)
- [cleaned-goodreads.ts](https://github.com/ajaymisraa/personal-website-features/blob/main/cleaned-goodreads.ts)

## Architecture

### Data Collectors (`scripts/collectors/`)
- **manual.ts**: Reads from existing markdown files in `src/content/books/`
- **goodreads-browser.ts**: Scrapes Goodreads using Playwright browser automation (handles JavaScript, authentication)
- **goodreads-rss.ts**: Alternative Goodreads collector using RSS feeds (no auth needed if enabled)
- **goodreads.ts**: Basic Goodreads scraper with Cheerio HTML parsing (fallback)
- **audible.ts**: (To be implemented) Handles Audible's obfuscated API with devirtualization
- **spotify.ts**: (To be implemented) Fetches audiobooks from Spotify API

### Integration Layer (`scripts/integration/`)
- **fuzzy-match.ts**: Resolves data collisions using similarity scoring (92% threshold, word-based Jaccard similarity)
- **normalize.ts**: Normalizes inconsistent formatting (author names "Last, First" → "First Last", cover URLs, etc.)

### Main Script (`scripts/vision-books.ts`)
Orchestrates the entire pipeline:
1. Collects from all sources
2. Normalizes data (removes articles, special chars, normalizes author names)
3. Resolves collisions with fuzzy matching (author + title matching)
4. Saves to `src/data/books.json`

## Usage

### Run aggregation manually:
```bash
npm run aggregate:books
```

### Automatic on build:
The aggregation runs automatically before each build:
```bash
npm run build
```

## Environment Variables

Create a `.env` file in the project root (or set in your deployment platform):

```env
GOODREADS_USER_ID=your_user_id_here
```

### Finding Your Goodreads User ID

Goodreads accepts either:
1. **Numeric User ID**: Found in your Goodreads profile URL (e.g., `https://www.goodreads.com/user/show/12345678` → use `12345678`)
2. **Username**: Your Goodreads username (e.g., `rahil-bhavan`)

The script will automatically resolve usernames to numeric IDs if needed.

To find your Goodreads user ID:
1. Go to your Goodreads profile page
2. Look at the URL: `https://www.goodreads.com/user/show/12345678-username`
3. Use either the numeric ID (`12345678`) or your username

### Goodreads Authentication

Goodreads requires authentication to view reading lists. The system uses **browser automation with Playwright** and supports cookie-based authentication.

#### Setting Up Authentication

**Option 1: Export Cookies Automatically (Recommended)**

1. Run the cookie export script:
   ```bash
   npm run export:goodreads-cookies
   ```
2. A browser window will open - log in to Goodreads manually
3. Cookies will be automatically saved to `scripts/.goodreads-cookies.json`
4. The browser automation will use these cookies for future requests

**Option 2: Manual Cookie Export**

1. Log in to Goodreads in your browser
2. Export cookies using DevTools or a browser extension
3. Save them to `scripts/.goodreads-cookies.json` (see `scripts/.goodreads-cookies.json.example` for format)
4. See `scripts/collect-cookies.md` for detailed instructions

**Option 3: Use RSS Feed (If Available)**

If your Goodreads profile has RSS enabled, the system will automatically try the RSS feed first (no authentication needed).

**Alternative**: You can manually export books from Goodreads and add them to `src/content/books/` as markdown files, and they'll be included in the aggregation.

#### Browser Automation Features

- **Headless browser**: Runs in background (no visible browser window)
- **Cookie support**: Uses saved cookies for authenticated requests
- **Polite fetching**: Random delays to appear more human-like
- **Multiple fallbacks**: Tries browser → RSS → basic scraping in order
- **Error handling**: Gracefully falls back if authentication fails

## Adding New Sources

1. Create a new collector in `scripts/collectors/`
2. Export a function that returns `RawBook[]`
3. Add it to `scripts/vision-books.ts` in the aggregation step

### Future Implementations (based on Ajay's vision-books.py):

- **Audible**: Requires devirtualization of obfuscated bytecode (similar to sneaker bot techniques)
- **Spotify**: Use Spotify Web API with OAuth token refresh
- **Physical Bookshelf**: Raspberry Pi + camera with OpenCV for OCR and perspective correction

## Fuzzy Matching

The system uses a 92% similarity threshold to determine if two books are the same (based on Ajay's implementation):
- **Normalization**: Removes leading articles (the/a/an), special characters, normalizes spaces
- **Author matching**: Handles "Last, First" vs "First Last" formats
- **Title matching**: Uses word-based Jaccard similarity + partial title matching
- **Merging**: Combines data from multiple sources, prefers more complete data (ratings, dates, covers)

## Data Flow

```
Markdown Files → Manual Collector
Goodreads → Goodreads Collector
    ↓
Normalization Layer
    ↓
Fuzzy Matching (Collision Resolution)
    ↓
JSON Output (src/data/books.json)
    ↓
Astro Books Page
```
