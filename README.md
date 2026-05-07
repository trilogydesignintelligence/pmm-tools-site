# PMM Tools — Showcase Site

A static GitHub Pages site showcasing the **PMM Tools** suite by **Trilogy Design Intelligence** (Trilogy Partners). Eight tools, eight user guides, one canonical schema.

> *Boots on the Ground, Eyes on the Sky.*

---

## What's in this repo

```
pmm-tools-site/
├── index.html                    # Main showcase page
├── .nojekyll                     # Tells GitHub Pages to skip Jekyll
├── README.md                     # This file
├── assets/
│   ├── css/
│   │   ├── main.css              # Homepage styles
│   │   └── guide.css             # Shared guide-page styles
│   └── js/
│       └── main.js               # Filter pills, search, reveals
└── guides/
    ├── pmm-horizon.html          # User guide (HTML)
    ├── pmm-horizon.md            # Same guide, downloadable
    ├── pmm-in-the-sky.html
    ├── pmm-in-the-sky.md
    ├── pmm-on-the-ground.html
    ├── pmm-on-the-ground.md
    ├── pmm-compass.html
    ├── pmm-compass.md
    ├── pmm-connection.html
    ├── pmm-connection.md
    ├── pmm-bridge.html
    ├── pmm-bridge.md
    ├── pmm-relay.html
    ├── pmm-relay.md
    ├── pmm-converter.html
    └── pmm-converter.md
```

The site is **pure static HTML / CSS / JS** — no build step, no bundler, no dependencies. Every path is relative, so it deploys to any GitHub Pages URL (root or subpath).

---

## Deploying to GitHub Pages

### Option 1 — Deploy from `main` branch root

1. Create a new GitHub repository (e.g. `pmm-tools-site`).
2. Push these files to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial PMM Tools showcase site"
   git branch -M main
   git remote add origin git@github.com:&lt;you&gt;/pmm-tools-site.git
   git push -u origin main
   ```
3. In the repo on GitHub: **Settings → Pages**.
4. Under **Source**, choose **Deploy from a branch**.
5. Branch: `main`, folder: `/ (root)`. Save.
6. Wait ~1 minute, then visit `https://&lt;you&gt;.github.io/pmm-tools-site/`.

### Option 2 — Deploy from `/docs` folder

If you want to keep these files inside a larger repo:

1. Move all files into a `docs/` folder.
2. **Settings → Pages** → Source: `main`, folder: `/docs`. Save.

### Option 3 — Custom domain

After Pages is enabled, add a `CNAME` file at the site root containing your domain (e.g. `pmm.trilogypartners.com`), then point a CNAME DNS record at `&lt;you&gt;.github.io`.

---

## Local preview

Open `index.html` directly in a browser, or run a tiny local server:

```bash
cd pmm-tools-site
python3 -m http.server 8000
# then visit http://localhost:8000
```

---

## Editing & extending

**Add a new tool card** — duplicate one of the `<article class="tool-card">` blocks in `index.html` and update the data-attributes (`data-category`, `data-keywords`) so filtering and search keep working.

**Add a new guide** — copy any `guides/*.html` as a starting point, update the TOC, masthead, and section content. Add a row to the guides table in `index.html`.

**Adjust the brand palette** — all colors are CSS variables defined at the top of `assets/css/main.css` and `assets/css/guide.css`. Change them in one place.

**Search behavior** — see `assets/js/main.js`. Press `/` to focus the search box, `Esc` to clear.

---

## About the design

This site uses bold editorial typography (Cormorant Garamond / Libre Baskerville / Barlow Condensed / DM Mono) and the PMM house palette (cream, burgundy, gold). Tool cards are color-coded by category — Ground (olive), Sky (slate-blue), Bridge (gold) — matching the architectural diagram. The grain overlay, vertical rules, italic display titles, and section numbering (§01, §02…) are intended to read as a printed brochure or technical journal rather than a generic SaaS landing page.

---

## Credits

- **Design & Requirements** — Trilogy Design Intelligence
- **Implementation** — Claude (Anthropic)
- **Schema** — PMM Attribute Schema v1.0

© Trilogy Partners
