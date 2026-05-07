# PMM Bridge

**User Guide — Web Application**

**Suite:** PMM Tools · Trilogy Design Intelligence
**Integration:** SketchUp ⟷ Buildertrend
**Version:** 1.0
**Audience:** Project Managers · Designers

---

## Contents

1. Overview
2. Getting Started
3. Selections Import
4. Estimate Import
5. BT PO → SketchUp Model · PMM Sync
6. Full Workflow
7. Tips & Troubleshooting

---

## 1. Overview

PMM Bridge is a web-based CSV import tool that sits between your SketchUp model and Buildertrend. It takes data exported from SketchUp, reformats it to match Buildertrend's import templates, and — after a Purchase Order is confirmed — reconciles the approved PO data back into your SketchUp model to keep everything in sync.

```
SketchUp Model  →  PMM Bridge  →  Buildertrend  ⟷  PMM Bridge  →  SketchUp Model
```

### The Three Modes

| Tab | Direction | What it does |
| --- | --- | --- |
| 🎨 **Selections Import** | SU → BT | Formats your SketchUp component data for Buildertrend's Selections sheet — Title, Category, Location, Allowance, Deadline, Instructions |
| 📋 **Estimate Import** | SU → BT | Formats your SketchUp component data for Buildertrend's Estimate — Title, Cost Code, Cost Type, Quantity, Unit Price, Amount, and optional Allowance flagging |
| 🔄 **BT PO → SketchUp** | BT → SU | After a BT estimate is approved and converted to a Purchase Order, reconciles the confirmed PO data back into your SketchUp model attributes. BT always wins on conflicts. |

### The PMM ID — Your Sync Key

Every component in SketchUp gets a unique `pmm_id` stamped into its attributes by the PMM Bridge Exporter plugin the first time it's exported. This ID survives every round trip between SketchUp and Buildertrend and is the key that lets PMM Bridge know which BT line item corresponds to which model element.

> **IMPORTANT** — The `pmm_id` is generated automatically; never edit or delete it manually. Without it, the BT PO → SketchUp sync cannot match records.

---

## 2. Getting Started

### What You Need

- PMM Bridge open at `trilogydesignintelligence.github.io/PMM-Bridge` in Chrome
- The PMM Bridge Exporter SketchUp plugin installed (for initial export)
- A Google account with access to your project's Drive folder
- A CSV exported from SketchUp via the PMM Bridge Exporter plugin

### Loading a File

Every mode starts with loading a source CSV. You have two options:

1. **Google Drive** — click the Google Drive button, sign in with your Google account, and select your CSV from Drive. Shared drives and workspace files are both accessible.
2. **Local file** — click Browse Local File (or drag and drop) to load a CSV from your computer.

> **TIP** — Use Google Drive whenever possible. It keeps the source file in your canonical PMM in the Sky Sheet location and ensures the whole team is working from the same data.

### The Four-Step Pipeline

All three modes follow the same pipeline shown at the top of the page:

| Step | What happens |
| --- | --- |
| **1 · Load File** | Load your source CSV from Drive or locally |
| **2 · Map Columns** | Tell PMM Bridge which CSV column corresponds to each Buildertrend field. PMM Bridge auto-detects common column names. |
| **3 · Options** | Set grouping, unit labels, amount calculation, filename, and any mode-specific settings |
| **4 · Download** | Review the output preview and download your formatted CSV |

---

## 3. Selections Import 🎨

Use this mode when you want to populate Buildertrend's Selections sheet with items from your SketchUp model — typically finish selections, material allowances, and client-choice items.

### Output Fields

| Field | Required | Notes |
| --- | --- | --- |
| Title | ✓ Required | Selection item name |
| Category | ✓ Required | e.g. Flooring, Plumbing Fixtures, Appliances |
| Location | Optional | Room or area, e.g. Primary Suite, Kitchen |
| Allowance | Optional | Dollar amount budgeted for this selection |
| Deadline | Optional | Date by which client must decide. Can set a default for all rows. |
| Instructions | Optional | Public-facing notes visible to the client in BT |
| Selections Notes | Optional | Internal notes — not visible to client |
| Cost Code | Optional | BT cost code for accounting |

### Options

- **Group by field** — group rows into sections by any source column (e.g. by room/area)
- **Default deadline** — applied to any row where a deadline isn't mapped
- **Include Allowance column** — toggle whether to include the dollar allowance in the output

### How to Import into Buildertrend

1. Download your formatted CSV from PMM Bridge
2. In Buildertrend, go to **Selections → Import**
3. Upload the CSV and use BT's column mapping wizard to match fields
4. Review and confirm

---

## 4. Estimate Import 📋

Use this mode to format your SketchUp component data for Buildertrend's Estimate import wizard. This is typically your first step when setting up a new project in BT from a SketchUp model.

### Output Fields

| Field | Required | Notes |
| --- | --- | --- |
| Title | ✓ Required | Line item name |
| Cost Code | ✓ Required | BT cost code / accounting category |
| Cost Type | Optional | Labor, Material, Sub, Equipment, Other |
| Group | Optional | Phase or trade grouping |
| Description | Optional | Detailed description of the line item |
| Quantity | ✓ Required | Numeric quantity |
| Unit | Optional | EA, LF, SF, LS — defaults to EA if not mapped |
| Unit Price | ✓ Required | Cost per unit |
| Amount | Optional | Can be calculated automatically (Qty × Unit Price) |
| Vendor / Sub | Optional | Assigned vendor or subcontractor |
| Internal Notes | Optional | Not visible to client |
| Mark As | Optional | Set to "Allowance" to route items to the Selections sheet |

### Allowance Flagging

The Allowance Flagging section in the Options panel lets you automatically mark certain rows as **Allowance** in the output. When BT imports these, it routes them to the Selections sheet instead of the standard estimate line items.

1. Enable **Allowance Flagging** in the Options panel
2. Choose which source column to check (e.g. `type` or `category`)
3. Enter the value to match (e.g. `selection` or `allowance`) — leave blank to flag all rows
4. Matching rows will show **● Allowance** in the output preview and the `Mark As` column in the downloaded CSV

### Amount Calculation

- **Calculate (Qty × Unit Price)** — PMM Bridge computes the total automatically
- **Use source column** — map an existing amount column from your CSV
- **Omit** — leave the Amount column blank

---

## 5. BT PO → SketchUp Model · PMM Sync 🔄

After a Buildertrend estimate is approved by the client and converted into a confirmed Purchase Order, use PMM Sync to reconcile the PO data back into your SketchUp model. This keeps your model attributes in sync with what was actually ordered — quantities, pricing, vendor assignments, and cost codes.

> **BT ALWAYS WINS** — In any field conflict between your SketchUp export and the Buildertrend PO, the BT value overwrites the SketchUp value. This is by design — the confirmed PO is the source of truth.

### What You Need

- Your **original SketchUp export CSV** — the file you exported before sending to BT, which contains the `pmm_id` column
- Your **Buildertrend PO export CSV** — exported from BT after the estimate was approved and converted to a PO

### Step by Step

1. Click the **BT PO → SketchUp Model · PMM Sync** tab — a Back button appears to return to the main modes
2. Load your **SketchUp Export CSV** using Google Drive or Browse Local (top left zone)
3. Load your **Buildertrend PO Export CSV** using Google Drive or Browse Local (top right zone)
4. Map the BT column mapping fields — especially the **PMM ID (match key)** which is required. PMM Bridge will auto-detect common column names.
5. Click **Reconcile & Diff**

### Field Coverage Report

Before reconciling, PMM Bridge validates every field and shows you a coverage report:

| Status | Meaning |
| --- | --- |
| ✓ **Will sync** | Field exists in both files and is correctly mapped — will update SketchUp |
| ⚠ **Unmapped** | Field exists in SU export but no BT column is mapped to it — will be skipped. A 💡 means a likely match was detected; scroll up and map it. |
| ✕ **Bad column** | Mapped to a BT column that doesn't exist in the loaded file — check the column name |
| ℹ **BT only** | Mapped but the field isn't in your SU export — won't write back |

### The Change Report

After reconciling, you'll see a summary with four stat boxes and a diff table showing exactly what changed:

- **Total Components** — all rows in your SU export
- **Unchanged** — matched in BT, no differences found
- **Fields Updated** — matched in BT, BT values applied
- **Unmatched in BT** — `pmm_id` not found in the BT export (component may have been removed or renamed in BT)

Use the tabs to filter the view: **All / Changed / Unmatched / Unchanged**. Changed rows show the old SU value struck through and the new BT value in gold.

### Downloads

- **Download Reconciled CSV** — the updated file with all BT values applied. Import this into SketchUp using the PMM Bridge Importer plugin.
- **Change Log** — a separate CSV listing every field that changed, with old and new values. Keep this for your project audit trail.

### Importing Back into SketchUp

1. Open your SketchUp model
2. Go to **Plugins → PMM Bridge — Import from BT**
3. Select the Reconciled CSV downloaded from PMM Bridge
4. The importer matches each row by `pmm_id` and writes the updated values back into the component's `dynamic_attributes` dictionary
5. A summary dialog shows how many components were updated and saves a timestamped change log CSV alongside the source file

---

## 6. Full Project Workflow

Here's how PMM Bridge fits into the complete PMM Tools project lifecycle:

### Phase 1 — Model Setup

1. Build your SketchUp model. Use your template plugin to add `type`, `cost_code`, `category`, and other PMM attributes to each component.
2. Run **Plugins → PMM Bridge — Export to CSV**. This stamps a `pmm_id` on each component and exports one CSV per component type (selections, estimate, PO).
3. Save the export CSVs to your PMM in the Sky Google Sheet folder.

### Phase 2 — Buildertrend Setup

1. Open PMM Bridge → **Selections Import**. Load your selections CSV from Drive, map columns, download the BT-formatted CSV.
2. Import the Selections CSV into Buildertrend's Selections sheet.
3. Open PMM Bridge → **Estimate Import**. Load your estimate CSV from Drive, map columns, download the BT-formatted CSV.
4. Import the Estimate CSV into Buildertrend's Estimate module.

### Phase 3 — PO Confirmation & Sync

1. In Buildertrend, work through your estimate. When the client approves, BT converts the estimate to a Purchase Order.
2. Export the confirmed PO from Buildertrend as a CSV.
3. Open PMM Bridge → **BT PO → SketchUp Model · PMM Sync**.
4. Load your original SU export + the BT PO export. Map fields, reconcile, review the change report.
5. Download the Reconciled CSV and Change Log.
6. In SketchUp: **Plugins → PMM Bridge — Import from BT** → select the Reconciled CSV. Model attributes update automatically.

> **YOUR MODEL STAYS CURRENT** — After Phase 3, your SketchUp model reflects the exact quantities, pricing, and vendor assignments in the confirmed Purchase Order — no manual re-entry needed.

---

## 7. Tips & Troubleshooting

### Google Drive Picker

- Use **Chrome** — Safari has cookie restrictions that prevent the Drive picker from opening
- If the picker shows a 403 error, check that your Google account is listed as a test user in the Google Cloud Console
- Run PMM Bridge from `trilogydesignintelligence.github.io` — the Drive picker won't work from a local `file://` URL
- If you get a token expired error mid-session, click the Drive button again — PMM Bridge will re-authenticate automatically

### Column Mapping

- PMM Bridge auto-detects common column names — if your SketchUp export uses the standard PMM attribute keys (`title`, `cost_code`, `quantity`, etc.) most fields will pre-fill automatically
- If a required field shows red, check that the corresponding column exists in your source CSV
- The source preview (first 5 rows) helps you verify the right column is mapped to each field

### PMM Sync — No Matches Found

- Make sure your SketchUp export CSV has a `pmm_id` column — if not, export fresh using the PMM Bridge Exporter plugin
- Make sure the **PMM ID (match key)** field in the BT column mapping is set to the column in your BT export that contains the `pmm_id` values
- If many rows show Unmatched, check whether BT renamed or reorganised line items — those won't match automatically

### CSV Formatting

- PMM Bridge handles standard comma-separated CSVs with or without quoted fields
- Enable **Trim whitespace** (on by default) to clean up any extra spaces in your source data
- Enable **Skip rows where Quantity = 0** to exclude placeholder components not yet priced

### Filename Tips

- Set a descriptive output filename in the Options panel before downloading — e.g. `HighMeadow_Selections_R1`
- Include a revision number or date so you can track which BT import corresponds to which model version

> **NEED HELP?** — Contact Trilogy Design Intelligence at **christianah@trilogybuilds.com** or reach out through your project coordinator.

---

*Boots on the Ground, Eyes on the Sky. Connect. Create. Construct.*
*PMM Bridge User Guide · Trilogy Design Intelligence · PMM Tools*
*trilogydesignintelligence.github.io/PMM-Bridge*
