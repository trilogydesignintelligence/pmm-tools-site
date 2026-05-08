# PMM Tools Site — Build v2 Integration Notes

This package contains the **v2 update** to the PMM Tools showcase site,
expanding the homepage from 6 sections (Hero / Method / Pipeline / Tools /
Guides / Footer) to 9 sections, restructured around a question hierarchy:

| Nav | Eyebrow | Answers |
|---|---|---|
| Method     | WHAT · THE METHOD             | What is PMM? |
| Process    | WHY · THE PROCESS             | Why does PMM work? |
| Stakeholders | WHO · STAKEHOLDERS          | Who is involved? |
| Tools      | HOW · THE TOOLS               | How is PMM delivered? |
| Guides     | WHEN/WHERE · DOCUMENTATION    | When/where do I learn it? |

---

## What's in this zip

```
pmm-tools-site/
├── index.html                       ← REPLACES your existing index.html
├── README.md                        ← this file (replace your old README too)
├── assets/
│   ├── css/
│   │   └── extensions.css           ← NEW — additive styles
│   ├── js/
│   │   └── extensions.js            ← NEW — orbital diagram + reveal observer
│   └── video/
│       ├── schmeiser-testimonial.mp4    ← NEW — embedded in Ten Years section
│       └── schmeiser-poster.jpg         ← NEW — poster frame at 0:05
```

**Files you keep from your existing repo (unchanged):**

- `assets/css/main.css` — your existing homepage styles. The new
  `extensions.css` is purely additive and reads your existing CSS variables.
- `assets/css/guide.css` — guide-page styles. Untouched.
- `assets/js/main.js` — your existing filter pills / search / reveal
  behaviour. The new `extensions.js` is purely additive and namespaced.
- `guides/*.html` and `guides/*.md` — all eight guide pages. Untouched per
  spec.
- `.nojekyll` — keep it.

---

## Merging into your repo

1. **Back up your current `index.html` and `README.md`** (or commit your
   current state first).
2. Copy this zip's contents over your repo. The new files will:
   - Replace `index.html` and `README.md`.
   - Add `assets/css/extensions.css`.
   - Add `assets/js/extensions.js`.
   - Add `assets/video/schmeiser-testimonial.mp4` and
     `assets/video/schmeiser-poster.jpg`.
3. Verify nothing else in your tree got touched. The `guides/`, `main.css`,
   `main.js`, and `guide.css` should all be exactly as you had them.
4. Test locally:
   ```bash
   cd pmm-tools-site
   python3 -m http.server 8000
   # open http://localhost:8000
   ```
5. Commit and push. GitHub Pages will pick it up.

---

## What changed in `index.html`

Every change is locked per the spec — nothing was invented or improvised.

### 1. Nav re-labeled
- `Process` now points to the new "Why" section (philosophical core).
- `Tools` now points to the existing pipeline + tools grid (the "How").
- New `Stakeholders` link added between `Process` and `Tools`.
- Order: Method · Process · Stakeholders · Tools · Guides

### 2. Hero rewritten
- Eyebrow unchanged.
- Title gets the registered trademark mark on the expansion line:
  `Project Management Modeling®`. This is the **only** place on the page
  the ® appears, per trademark hygiene rules. The character is proper
  Unicode `®` (U+00AE), wrapped in a small `<sup class="reg-mark">` for
  size/colour control.
- New lede leans on the "Rocky Mountain Superhomes" and "model itself
  manages the project" framing.
- Stats replaced with: Since 2017 · 10+ yrs · 8 · 99%.

### 3. Method (WHAT) — pillars expanded
Each pillar (Connect / Create / Construct) now has a second paragraph in
italic, indented behind a gold rule. The CONSTRUCT pillar is legally
rephrased: the model *coordinates* construction as a *companion to* the
construction documents, not a replacement for them.

### 4. Process (WHY) — NEW section
Heading: *The model is the project.* Three editorial paragraphs followed
by the eight numbered "Why PMM" cards in a two-column grid (single column
on mobile).

### 5. Stakeholders (WHO) — NEW section
Heading: *Eight roles. One model. Total alignment.*

- **Desktop / tablet:** orbital SVG diagram with eight role nodes
  circling the central PMM Model node. Faint gold connector lines run
  from each role to the core. The core has a subtle pulse animation
  (disabled by `prefers-reduced-motion`).
- **Interaction:** hover (or focus) any role to preview that role's
  detail panel; click to lock it; click the core or anywhere outside
  the diagram to reset. Arrow keys navigate between role nodes;
  Enter/Space activates; Escape clears.
- **Mobile (< 880 px):** orbital diagram is hidden; all eight roles
  render as a vertical accordion of cards, each with its own gold
  left-rule and tool pills.

### 6. Ten Years (origin) — NEW section
Editorial origin story (three paragraphs, drop-cap on first), Lawrence
Kim pull-quote with gold accent rule, then the Schmeiser video framed
in burgundy/gold with the locked two-line caption. Native browser
controls; `preload="metadata"`; no autoplay; `playsinline` for iOS.

### 7. Tools (HOW) — pipeline updated
- Stage 01 changed from `Revit` to `BIM Authority`, with sublabel
  `Revit · ArchiCAD · Vectorworks · IFC export` and expanded copy.
- Detail panel updated to match.
- AI Bridge callout headline changed to *"The methodology is ten years
  old. The bridges are new."* with the locked body copy.
- Eight-card filterable grid: untouched.

### 8. Guides (WHEN/WHERE) — eyebrow only
Eyebrow text changed; table content untouched.

### 9. Footer — minor
Added the new `Stakeholders` link in the "The Process" column so the
footer nav stays in sync with the header nav.

---

## What `extensions.css` adds

All new styles for sections 4 (Why), 5 (Stakeholders), and 6 (Ten Years),
plus:

- `.pillar-aside` — the italic indented aside under each Method pillar.
- `.reg-mark` — the small gold ® glyph on the hero title.
- `scroll-margin-top` on every anchored section so the sticky nav doesn't
  cover headings when nav links are clicked.

The file uses CSS variables with fallbacks (e.g. `var(--cream-100, #f5efe1)`)
so it'll inherit your existing palette tokens and work even if a token
name differs slightly.

The file ends with a `prefers-reduced-motion` block that disables the core
pulse, the reveal-on-scroll fade, and orbital transitions for users who've
opted out.

---

## What `extensions.js` adds

Two things:

1. **Orbital diagram behavior** — wires hover/click/keyboard interaction
   on the eight role nodes and the central core, swaps the active panel,
   draws SVG connector lines from each node to the core, brightens the
   active line, and dims inactive nodes to 40% opacity.

2. **Reveal-on-scroll fallback** — uses `IntersectionObserver` to add
   `is-visible` to any `.reveal` element that doesn't already have it.
   This is **idempotent** with your existing `main.js` — if your main.js
   already adds `is-visible` first, this script's `:not(.is-visible)`
   selector skips those elements.

The script self-executes inside an IIFE, has zero dependencies, and adds
no globals.

---

## Trademark hygiene (LOCKED)

- `Project Management Modeling®` appears **exactly once**, in the hero
  title.
- The ® is real Unicode (U+00AE), not `(R)` or `&reg;`.
- All other prominent mentions on the homepage are plain text.
- The 8 guide pages are unchanged; if you want to apply the same
  one-mark-per-page rule there, that's a separate task.

---

## Brand architecture (LOCKED)

- **Trilogy Partners** — 25-year construction company, parent. Originator
  of PMM. Led by Michael Rath, CEO. (Rath is **not named** anywhere on the
  homepage copy — the story is institutional.)
- **Trilogy Design Intelligence** — Tech division operating under
  Trilogy Partners. Builds the software.
- **PMM Tools** — The product suite (8 tools).
- **Project Management Modeling®** — The methodology. USPTO-registered.
- **AI** — Credited only as the "bridges" that eliminated manual labor in
  2026. The intelligence has always lived in the people, the methodology,
  and the model.

---

## Video asset

`assets/video/schmeiser-testimonial.mp4` — 15 MB, 1280×720, ~2:47.
`assets/video/schmeiser-poster.jpg` — 77 KB, frame at 0:05 (aerial of
Rocky Mountain home in autumn).

The video element uses native browser controls and `preload="metadata"`,
so the poster is what the user sees until they press play. Mobile shows
the same poster; `playsinline` keeps iOS from forcing fullscreen.

---

## Local preview

```bash
cd pmm-tools-site
python3 -m http.server 8000
# then visit http://localhost:8000
```

Test the orbital diagram on a desktop browser at >880px width, then
narrow the window past 880px to verify the accordion fallback engages.

Press `/` to focus the tools search box (existing main.js behavior).
Tab through the orbital nodes to verify keyboard navigation.

---

## Deploying to GitHub Pages

Same as before — see your previous README's "Option 1 / Option 2 / Option 3"
sections. Nothing about the deployment changes.

---

## About the design

Continues the bold editorial typography (Cormorant Garamond /
Libre Baskerville / Barlow Condensed / DM Mono) and the PMM house palette
(cream, burgundy, gold). The new sections add:

- A drop-cap initial in the Ten Years origin prose.
- A burgundy-and-gold framed video block with editorial caption.
- An orbital SVG diagram for the stakeholders section.
- Two-column why-card grid with gold accent meta-numbers.

The intent throughout is "printed brochure or technical journal," not
"SaaS landing page."

---

## Credits

- **Design & Requirements** — Trilogy Design Intelligence
- **Implementation** — Claude (Anthropic)
- **Schema** — PMM Attribute Schema v1.0

© Trilogy Partners
