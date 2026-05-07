# PMM in the Sky

**The canonical project Google Sheet — single source of truth for everything commercial.**

*A user guide from the PMM Tools suite by Trilogy Design Intelligence.*

**Tool 02 · v1.0 · Schema v1.0**  

**Audience:** All Users

---

PMM in the Sky is the project's Google Sheet — the canonical source of truth for everything commercial. Prices, vendors, cost codes, specifications, statuses. It is where the PM works, where the estimator works, and where every other tool in the suite reads from.


# Part I — Foundations


## 1. What PMM in the Sky Is

PMM in the Sky is a structured Google Sheet, not a separate application. Every project has its own Sheet, organized into a fixed set of tabs that all PMM tools recognize:

- `_Index` — every PMM-tagged component in the model, one row each, keyed by `PMM ID`
- `_Meta` — project-level metadata (project name, schema version, last sync)
- **Category tabs** — one tab per Cost Category (e.g. `06 - Carpentry`, `22 - Plumbing`, `26 - Electrical`)

PMM Horizon writes to this Sheet from SketchUp. PMM Compass and PMM on the Ground read from it. PMM Relay watches it for changes and pushes confirmed commercial data to Buildertrend.

> **DESIGN PRINCIPLE** — The Sheet is the truth. Every other tool — Horizon, Compass, Relay, on the Ground — is a view onto this Sheet. Turn off any of them and zero data is lost.


## 2. Access &amp; Permissions

Sheets live in the project's Google Drive folder. The standard share matrix:

| Role | Access |
|---|---|
| PM / Estimator | Editor |
| Designer (push from Horizon) | Editor (limited tabs) |
| PMM Relay service account | Viewer |
| Subcontractor | Never direct — they use PMM on the Ground |
| Client | Never direct |

The Relay service account email (the `client_email` in your service-account JSON) needs Viewer access on every project Sheet. Add it like sharing a Doc with a person.


## 3. First-Time Setup

You can either create a Sheet from PMM Horizon (recommended) or link an existing one:

#### Option A — Create from Horizon

- Open the project model in SketchUp
- **Extensions → PMM Horizon → Create New Sheet…**
- Horizon creates the Sheet, scaffolds tabs, and links the model

#### Option B — Link an existing Sheet

- Open or create the Sheet manually from a master template
- Copy the Sheet ID from the URL (the long string between `/d/` and `/edit`)
- In SketchUp: **Extensions → PMM Horizon → Link to Existing Sheet…**
- Paste the Sheet ID


# Part II — Daily Use


## 4. Working in Category Tabs

Each Cost Category gets its own tab — `06 - Carpentry`, `22 - Plumbing`, etc. Tabs are auto-created the first time a component with that Cost Category is pushed.

Columns split into three zones:

- **Layer 1 — Identity & Sync** (PMM ID, Sync Status, Last Modified). *Auto-managed*; do not edit.
- **Layer 2 — Model** (Component Name, Length, Width, Height, Quantity, Location, Storey). Pushed from SketchUp.
- **Layer 3 — Commercial** (Title, Description, Cost Code, Cost Type, Unit Price, Vendor, Allowance, Deadline, Notes). *Edit freely*. PMM Horizon pulls these back into SketchUp for read-only display.

Headers use Title Case With Spaces (e.g. `Unit Price`, not `unit_price`) per Schema v1.0.


## 5. Marking Selections / Allowances

To route a component to BT's Selections sheet (instead of the Estimate), set its `Mark As` column to `Allowance`. PMM Relay reads this on its next sync and BT's import wizard handles the routing.

Set `Selection Category` and `Allowance Amount` to populate the Selections record fully.


## 6. Vendors &amp; Cost Codes

Vendor names and cost codes flow from the Sheet to Buildertrend via Relay. Two rules:

- Vendor names must match BT exactly (Relay does not fuzzy-match). If your Sheet says *"Acme Lumber Co"* but BT has *"Acme Lumber Company"*, Relay will surface a vendor lookup error.
- Cost Codes use the format `NN.NN.NN` (e.g. `06.20.10`) per the BT cost-code reference.


# Part III — Reference


## 7. Schema v1.0

PMM in the Sky conforms to **PMM Attribute Schema v1.0**. See the [PMM Connection → Schema reference](pmm-connection.html#schema) for the complete field list across all four layers (Identity & Sync, Model, Commercial, Type-specific).

Schema version is tracked in the `_Meta` tab so tools can validate compatibility.


## 8. Protected Ranges

Several ranges are locked by default to prevent accidental edits:

- Header row (row 1) on every tab
- The `PMM ID` column
- The `_Index` tab structure (columns and rows)
- The `_Meta` tab (values are editable; structure is not)

If you need to edit a protected range, ask your PM. They hold the unlock permission.


# Part IV — Care & Repair


## 9. Troubleshooting

### "This action requires permission"

You're trying to edit a protected range. Either you're editing a column you shouldn't (Layer 1), or you need PM-level access.

### Horizon push reports "Sheet not found"

The Sheet was renamed or moved. Re-paste the Sheet ID into Horizon's Settings.

### Two rows for the same component

Almost always caused by copy-paste in SketchUp creating duplicate `PMM ID`s. Run **Audit Missing UUIDs** in Horizon to detect, then re-stamp.

### Relay reports "Vendor lookup failed"

Vendor name in the Sheet doesn't match any vendor in Buildertrend. Either add the vendor in BT first, or fix the spelling in the Sheet.


## 10. Credits

Part of the PMM Tools suite by Trilogy Design Intelligence, a service of Trilogy Partners.

- **Design and requirements** — Trilogy Design Intelligence
- **Implementation** — Claude (Anthropic)
- **Questions or issues** — christianah@trilogybuilds.com

Follows the PMM Attribute Schema v1.0.

*Trilogy Partners. Boots on the Ground, Eyes on the Sky.*


---

**PMM in the Sky User Guide · v1.0**  
*Trilogy Partners. Boots on the Ground, Eyes on the Sky.*
