# yet Another TZ Tool — time.lechu.dev

> Retro neon world timezone clock. 100% static, no tracking, no build step.

## What it does

- Live clocks for multiple timezones simultaneously, World Time Buddy style
- Add timezones by city name, IANA ID, or **offset notation** (`UTC-3`, `GMT+5`, `+2`, `-11`)
- Retro neon dark theme with scanline texture; one-click light mode toggle
- 12/24h format toggle, persisted to LocalStorage
- Remove any column with the × button
- **Crosshair hover** — hover any hour row to see the equivalent time across all zones
- **Local clock widget** — top-right header shows your detected timezone, live time, and date
- Selections persisted to LocalStorage and encoded in the URL hash (shareable links)
- Default timezones: Madrid, Lisbon, Buenos Aires, Berlin, UTC, Paris

## Stack

| Layer | Technology |
|---|---|
| UI | Vanilla HTML5 / CSS3 / ES2020 modules |
| Timezone data | Browser `Intl.DateTimeFormat` + IANA tz database |
| Fixed offsets | `Etc/GMT±N` IANA zones (whole-hour offsets only) |
| Persistence | `localStorage` (with in-memory fallback) |
| Sharing | URL hash encoding |
| Hosting | Cloudflare Pages (static, no Workers) |
| Icons | Inline SVG |
| Fonts | System font stack — no web fonts |

## File structure

```
time.lechu.dev/
├── index.html          ← entry point
├── style.css           ← all styles, CSS custom properties, dark + light themes
├── js/
│   ├── app.js          ← clock loop, grid rendering, crosshair, event handling
│   ├── timezones.js    ← IANA tz list, search, offset parser (UTC±N)
│   └── storage.js      ← LocalStorage read/write with try/catch fallback
├── assets/
│   └── favicon.svg
├── _headers            ← Cloudflare Pages: CSP, HSTS, X-Frame-Options, etc.
├── _redirects          ← Cloudflare Pages: routing stubs
├── .gitignore
└── .env.example
```

## Offset timezone support

Type any of these in the search box:
- `UTC-3`, `UTC+5`, `UTC+0`
- `GMT-8`, `GMT+1`
- `+2`, `-11`

Only whole-hour offsets are supported (`Etc/GMT±N`). Half-hour offsets like `+5:30` are not in the `Etc/GMT` family — use the city name instead (e.g. `Calcutta`).

## Local development

No build step. Serve with any static file server:

```bash
# Python (built-in)
python3 -m http.server 8080 --directory /path/to/time.lechu.dev

# Node (npx, no install)
npx serve /path/to/time.lechu.dev
```

Then open `http://localhost:8080`.

## Linting (optional)

```bash
npx htmlhint index.html
npx stylelint style.css
npx eslint js/app.js js/timezones.js js/storage.js
```

## Deployment

Push `main` to GitHub → Cloudflare Pages auto-deploys.

```
Build command:    (none)
Output directory: /
Branch:           main
```

Custom domain `time.lechu.dev` via Cloudflare DNS CNAME → Pages project.

## Security

- `_headers` enforces `Content-Security-Policy: default-src 'self'`, HSTS, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`
- No `innerHTML` with user data — all DOM built via `createElement` / `textContent`
- LocalStorage values validated against known-good IANA list before use
- No external requests at runtime

## curl / CLI API

A Cloudflare Pages Function at `/tz/` provides timezone diff data without a browser.

```bash
# Your detected timezone vs one zone
curl time.lechu.dev/tz/Madrid

# Diff between two zones
curl time.lechu.dev/tz/Madrid/Munich
curl time.lechu.dev/tz/New_York/Tokyo
curl time.lechu.dev/tz/UTC+2/Berlin
```

- `curl`/`wget`/`httpie` → plain text output
- Browser → JSON
- Your timezone is auto-detected from the Cloudflare request (`cf.timezone`)
- Accepts city names, IANA IDs, or offset notation (`UTC+2`, `+5`, `-3`)

Source: `functions/tz/[[route]].js`

## Status

🟢 Core UI complete. Local clock widget added. GitHub repo live at [github.com/lechu77/time.lechu.dev](https://github.com/lechu77/time.lechu.dev).
Cloudflare Pages + DNS pending.
