# PMM Horizon

**User Guide — Pushing SketchUp to PMM in the Sky**

Version 0.4.0 · Schema v1.0 aligned

*Created by Trilogy Partners using Trilogy Build Intelligence.*
*Boots on the Ground, Eyes on the Sky.*

---

## Contents

**Part One — Quick Start**
1. What PMM Horizon Does
2. Installation
3. Your First Push
4. Anatomy of a Push

**Part Two — Core Workflows**
5. The Push Workflow
6. Auto-Push
7. Pull from Sheet
8. The Component Info Panel
9. Schema v1.0 Migration

**Part Three — Reference**
10. Menu Reference
11. Field Schema (v1.0)
12. Sheet Structure
13. Configuration & OAuth

**Part Four — Practical Notes**
14. Troubleshooting
15. System Requirements & File Locations
16. Credits

---

# Part One — Quick Start

Get installed, link your first project, and push your first components to a Google Sheet.

---

## 1. What PMM Horizon Does

PMM Horizon is a SketchUp extension that connects your model to PMM in the Sky — the project's Google Sheet that serves as canonical truth for every commercial decision (vendors, prices, cost codes, specs).

### A typical Trilogy project flow

1. **PMM Connection** ingests the architect's Revit IFC, writes structured PMM data onto SketchUp components.
2. Designers refine the model, tagging additional design elements (furniture, fixtures, decor) via Connection.
3. **PMM Horizon** (here) pushes those tagged components to a Google Sheet — one row per component, one tab per Cost Category.
4. Your team edits commercial data (Unit Price, Vendor, Cost Code, Allowance, Deadlines) directly in the Sheet.
5. **PMM on the Ground** lets subs view the project on their phones. **PMM Compass** gives admins a rollup dashboard. **PMM Relay** pushes the data to Buildertrend automatically.

PMM Horizon's job is the bridge between SketchUp and the Sheet. It never talks to Buildertrend directly.

> **THE EDITING RULE**
> Commercial fields (Unit Price, Vendor, Cost Code, Description, etc.) are edited only in the Sheet. Model-owned fields (PMM ID, dimensions, Component Type, Location) are edited only in SketchUp. PMM Horizon enforces this — it pushes model data to the Sheet, and pulls Sheet data into SketchUp for read-only display only.

### Audience

This guide is for Trilogy designers and external collaborators who push models to project Google Sheets.

---

## 2. Installation

You need SketchUp 2021 or newer. The plugin works on macOS and Windows.

### Install steps

1. **Extensions → Extension Manager**
2. Click **Install Extension…** at the bottom-left
3. Choose `pmm_horizon_v0.4.0.rbz`
4. SketchUp will warn that the extension is not signed by Trimble — click **Yes** to proceed
5. Restart SketchUp

After restart, look for **Extensions → PMM Horizon** in the menu bar. On older SketchUp versions this appears as **Plugins → PMM Horizon**. A PMM Horizon toolbar also appears with quick-access Push, Pull, and Info buttons.

### Updating

To install a newer version:

1. **Extension Manager** → find the existing PMM Horizon entry
2. Click **Uninstall**
3. Restart SketchUp
4. Install the new `.rbz` (steps 1–5 above)

> **TAGGED DATA AND LINKS ARE PRESERVED**
> Component PMM attributes survive plugin updates. Project-to-Sheet links (stored on the model itself) are preserved. OAuth tokens (stored in `~/.pmm_bridge/`) are preserved.

---

## 3. Your First Push

The fastest path to seeing PMM Horizon work: link your model to a Google Sheet, push a tagged component, watch the Sheet update.

### What you need

- A SketchUp model with at least one PMM-tagged component (use PMM Connection or tag manually)
- A Google account with permission to create or access a Google Sheet
- The Sheet ID for the project's Google Sheet (or you can create one through the plugin)

### Link the model to a Sheet

1. **Extensions → PMM Horizon → Link to Existing Sheet…** (or **Create New Sheet…** if you don't have one yet)
2. A browser opens for Google OAuth. Sign in with your Trilogy Google account.
3. Approve the requested permissions (Google Sheets and Google Drive access)
4. Back in SketchUp, paste the Sheet ID when prompted
5. The plugin reports success: *"Model linked to Sheet 25 Hickory Lane"*

### Run your first push

1. Select any PMM-tagged component in your model
2. **Extensions → PMM Horizon → Push Selection to Google Sheet**
3. The status bar shows *PMM Horizon: pushing 1 row(s)…*
4. Open the Sheet in your browser

You should see:

- An `_Index` tab with a row referencing your component's `PMM ID`
- A `_Meta` tab with project metadata
- A category tab named after the component's Cost Category (e.g. `06 - Carpentry`) with the component's row

> **PMM HORIZON WRITES, IT DOESN'T MERGE**
> Horizon's push is a structural sync: it adds new components, updates Layer 1 (Identity & Sync) and Layer 2 (Model) fields on existing rows, and preserves Layer 3 (Commercial) fields entirely. Your team's edits to Vendor, Unit Price, etc. are never overwritten by a push.

### Push the full model

When ready: **Extensions → PMM Horizon → Push to Google Sheet (Full Model)**.

This iterates every PMM-tagged component (recursively, into nested groups and components) and writes them to the Sheet. On a 200-component luxury home model, expect 5–15 seconds. Larger models scale linearly.

---

## 4. Anatomy of a Push

When PMM Horizon pushes a component, three things happen on the SketchUp side and three things happen on the Sheet side.

### SketchUp side

For each component being pushed:

1. **Identity stamping.** If the component has no `PMM ID`, one is generated (RFC 4122 v4 UUID, lowercase, hyphenated). This is one-time and permanent — the ID never changes.
2. **Auto-derived field refresh.** `Component Name`, `Length`, `Width`, `Height`, `Instance GUID`, and `Last Pushed to Sheet` are recomputed from the live model.
3. **Lazy migration.** If the component still has legacy v0.3.x attributes in the `pmm_bridge` dictionary, they're auto-copied to the new `PMM` dictionary using v1.0 Title Case keys. The old data is preserved through v0.5.0 in case rollback is needed.

### Sheet side

1. **`_Index` lookup.** The plugin checks `_Index` for an existing row matching this `PMM ID`. If found, it goes to that row in the indicated tab. If not found, a new row is appended to the appropriate Cost Category tab.
2. **Selective field write.** Only Layer 1 (Identity & Sync) and Layer 2 (Model) columns are written. Layer 3 (Commercial) columns are left untouched — your team's commercial edits are preserved.
3. **`_Index` update.** A new row in `_Index` is created (or updated) so future pushes find this component fast.

### What about deletes?

If you delete a component in SketchUp and run **Push to Google Sheet (Full Model)**, the plugin notices the missing `PMM ID` and soft-deletes the row by marking `status: deleted` in `_Index`. The row's data stays intact — useful for audit trails and easy undo. A future push that finds the component again restores `status: active`.

> **TWO PUSHES, TWO UNDO STEPS**
> SketchUp-side changes (UUID stamps, attribute migrations) and Sheet-side changes (API writes) are not tied together by SketchUp's undo. If something goes wrong mid-push, the SketchUp-side state can be rolled back via Undo; the Sheet has to be fixed via the Sheet itself or a re-push.

---

# Part Two — Core Workflows

The five operations that make up day-to-day PMM Horizon use.

---

## 5. The Push Workflow

The primary action. Run this whenever you've made model changes you want reflected in the Sheet.

### When to use

- After tagging new components via PMM Connection
- After a design revision that changed dimensions or locations
- Before a client meeting or project review where the Sheet will be referenced
- Any time you want the Sheet up to date

### The two scopes

| Action | What it pushes |
|---|---|
| Push to Google Sheet (Full Model) | Every PMM-tagged component, recursively |
| Push Selection to Google Sheet | Only currently-selected components |

Selection mode is faster — use it when you've changed only one or two things and don't want to wait for a full-model push.

### What gets written

For each component, the push writes these columns to the Sheet:

**Layer 1 — Identity & Sync.** `PMM ID`, `Last Modified`, `Last Pushed to Sheet`. Other Layer 1 fields (`Buildertrend ID`, `Sync Status`, `Last Synced`) are left for PMM Relay to manage.

**Layer 2 — Model.** `Component Name`, `Component Type`, `IFC Class`, `Instance GUID`, `Length`, `Width`, `Height`, `Quantity`, `Location`, `Storey`, `Status`, `Project Phase`, `Review Notes`.

It does *not* write any Layer 3 (Commercial) columns. Those are Sheet-owned.

### Conflict prevention

What if two designers push the same model at nearly the same time? Each push is a series of Sheet API calls — Google enforces last-write-wins per cell. In practice:

- If both designers pushed identical model data, the result is the same regardless of order
- If they pushed different model data, the second push wins
- This rarely causes real problems because Layer 2 fields don't usually change rapidly

For coordinated team workflows, use **Auto-Push** (next section) — debouncing reduces concurrent-push collision substantially.

---

## 6. Auto-Push

Auto-Push watches your model for changes and pushes them automatically with a 5-second debounce. Set it on at the start of a working session, forget about it, and the Sheet stays continuously up to date.

### Toggle

**Extensions → PMM Horizon → Toggle Auto-Push**

The menu item shows the current state: ☑ when on, ☐ when off. Toolbar button reflects the same.

### How it works

When Auto-Push is ON:

1. PMM Horizon installs a model observer that listens for component changes
2. When a tagged component changes (attribute edit, scale, move, etc.), the change goes into a debounce queue
3. 5 seconds after the last change, the queue flushes — all queued changes are pushed in one Sheet API batch
4. The status bar shows *PMM Horizon: synced 4 row(s)* after each flush
5. Mid-flush failures (network hiccup) silently re-queue — nothing is lost

### When to turn it off

- During heavy refactoring where you'll redo many things
- When your network is unreliable
- When you want pushes to happen only at known checkpoints

### Manual flush

**Extensions → PMM Horizon → Flush Auto-Push Queue Now** — forces an immediate push of any pending changes. Useful before disconnecting from the network or closing SketchUp.

> **AUTO-PUSH AND VERSION CONTROL**
> Auto-Push pushes to the Sheet in real-time. The Sheet itself isn't version-controlled — Google's edit history is the only audit trail. For high-stakes projects where you need explicit checkpoints, turn Auto-Push off and use manual pushes at meaningful milestones.

### Save-trigger flush

When SketchUp saves the model, a final flush fires automatically. This guarantees that the Sheet reflects everything in the saved `.skp` — important for handoffs to other team members.

---

## 7. Pull from Sheet

The complement to Push. Pull retrieves Sheet data into SketchUp for read-only display.

### When to use

- Before a project review, to refresh component info with the latest commercial data from the Sheet
- When a sub asks "what's the price/vendor on this?" and you want to see it in SketchUp
- After Project Managers have updated allowances or vendors and you want them visible while modeling

### Run a pull

**Extensions → PMM Horizon → Pull from Sheet**

The plugin reads the `_Index` and category tabs of the linked Sheet, and writes Layer 3 (Commercial) values into the `PMM` dictionary on each component (under the same Title Case keys as in the Sheet).

After pulling, the Component Info Panel (Section 8) shows up-to-date commercial data: Unit Price, Vendor, Cost Code, etc.

### Read-only enforcement

Pull writes to the same `PMM` dictionary that Connection and Horizon use, but only for Layer 3 fields (`Title`, `Description`, `Cost Category`, `Cost Code`, `Cost Type`, `Selection Category`, `Unit`, `Unit Price`, `Amount`, `Allowance`, `Vendor`, `Deadline`, `Instructions`, `Selections Notes`, `Scope of Work`, `PO Date`, `PO Notes`, `Group`, `Image URL`, `Notes`).

The plugin's `AttrReader` module enforces that Layer 3 fields are never written by user actions — only by Pull. So if a designer accidentally types a price into Entity Info, the next Pull will overwrite it with the Sheet's authoritative value. The Sheet always wins for Layer 3.

### What about stale data?

Pulled values are a snapshot at pull time. If a Project Manager updates the Sheet 5 minutes after your pull, your SketchUp won't know until the next pull. For continuously-fresh data, run pulls before each work session, or set up a scheduled pull (advanced — see Configuration).

---

## 8. The Component Info Panel

A live, dockable panel that shows full PMM data for the selected component. Read-only — view only, no editing.

### Open

**Extensions → PMM Horizon → Show Component Info Panel** (or the toolbar Info button)

The panel docks beside the model viewport. It updates as you change selection.

### What it shows

The panel is organized into the four PMM Schema v1.0 layers:

- **Identity & Sync** (top): `PMM ID`, `Last Modified`, `Last Pushed to Sheet`, `Sync Status`, `Buildertrend ID`. Indicates whether this component has reached BT yet.
- **Model:** `Component Type`, `Component Name`, dimensions, `Location`, `Storey`, `Status`, `Project Phase`. The structural facts about this component.
- **Commercial:** `Title`, `Cost Category`, `Cost Code`, `Cost Type`, `Selection Category`, `Unit`, `Unit Price`, `Amount`, `Allowance`, `Vendor`, `Deadline`, etc. Pulled from the Sheet.
- **Type-specific** (when present): For walls — `Wall Assembly`, `Fire Rating`, `R-Value`. For doors — `Door Material`, `Handing`, `Hardware Group`. Etc. Set in PMM Connection's Inspector; displayed read-only here.

### When the Commercial section is empty

If a component has been pushed to the Sheet but never pulled back, Commercial fields show "Pull from Sheet to populate". After a pull, they fill in.

If the component has never been pushed, Commercial fields show "This component has not been pushed yet".

### Multi-selection

Select more than one component: the panel shows fields all share, with "— mixed values —" where they disagree. Use this to spot inconsistencies (e.g. "two cabinets from the same vendor have different Cost Codes").

---

## 9. Schema v1.0 Migration

In v0.4.0, PMM Horizon adopts **PMM Attribute Schema v1.0** — the unified contract shared with PMM Connection, Compass, on the Ground, Bridge, and Relay. Existing models on older schemas can migrate automatically.

### What changed

| Before (v0.3.x) | After (v1.0) |
|---|---|
| Multiple dictionaries: `pmm_bridge`, `pmm_bridge_sheet` | Single dictionary: `PMM` |
| snake_case keys: `pmm_uuid`, `cost_category` | Title Case keys: `PMM ID`, `Cost Category` |
| Sheet column headers in snake_case | Sheet column headers in Title Case |

### Lazy migration (automatic)

When v0.4.0 reads a component that has legacy v0.3.x data:

1. The data is auto-copied to the new `PMM` dictionary with v1.0 keys
2. The original `pmm_bridge` data is preserved in place (not deleted) through v0.5.0
3. The component is now Schema v1.0 conformant

This happens silently the first time the component is touched (selected, pushed, pulled, displayed). No user action needed.

### Eager migration (manual)

To migrate an entire model at once:

**Extensions → PMM Horizon → Migrate Model to Schema v1.0**

A confirmation dialog shows you:

- Total components scanned
- Already on v1.0
- Need migration

Proceed, and every component is migrated in one undo step. Safe to run multiple times — already-migrated components are skipped.

### Sheet header migration

Existing project Sheets have snake_case column headers (`pmm_uuid`, `cost_category`). To upgrade them to Title Case:

**Extensions → PMM Horizon → Migrate Linked Sheet to Schema v1.0**

This rewrites column headers in every category tab. Data rows are not touched. The `_Index` tab keeps its snake_case headers per the spec (internal plumbing).

> **MIGRATION TIMELINE**
> **v0.4.x (current)** — both legacy and v1.0 data work side by side. Lazy migration on touch.
> **v0.5.0 (future)** — legacy data removal. Run eager migration before upgrading to v0.5.0.
> **v1.0 (future)** — v1.0 schema only.
> Always run Migrate Model and Migrate Linked Sheet before upgrading to v0.5.0.

---

# Part Three — Reference

Menus, the PMM Schema v1.0 layers, and configuration locations.

---

## 10. Menu Reference

All items live under **Extensions → PMM Horizon** (or **Plugins** on older SketchUp).

| Menu Item | What it does |
|---|---|
| Push to Google Sheet (Full Model) | Push every PMM-tagged component to the linked Sheet |
| Push Selection to Google Sheet | Push only the current selection |
| Pull from Sheet | Refresh Layer 3 (Commercial) fields from Sheet to model |
| Toggle Auto-Push | Enable/disable automatic push on model change (5s debounce) |
| Flush Auto-Push Queue Now | Force immediate push of pending changes |
| Show Component Info Panel | Open the live read-only attribute viewer |
| Open Linked Sheet in Browser | Convenience: opens the Sheet in your browser |
| Link to Existing Sheet… | Bind this model to an existing Google Sheet by ID |
| Create New Sheet… | Auto-create a new Sheet, scaffold tabs, link the model |
| Unlink Sheet from This Model | Remove the link (does not delete the Sheet) |
| Show Link Status | Display the linked Sheet's name and ID |
| Stamp UUIDs on All Components | Pre-stamp PMM IDs on every PMM-tagged component without one |
| Audit Missing UUIDs | Report on tagged components missing a PMM ID |
| Migrate Model to Schema v1.0 | One-time: migrate every component's legacy attrs to v1.0 |
| Migrate Linked Sheet to Schema v1.0 | One-time: rewrite Sheet column headers to Title Case |
| Sign Out of Google | Clear OAuth tokens; next push will require re-auth |
| About PMM Horizon | Version, attribution, companion-app references |

### Toolbar

The PMM Horizon toolbar includes quick-access buttons for Push, Pull, and Show Component Info Panel. Drag the toolbar to dock it where convenient.

---

## 11. Field Schema (v1.0)

PMM Horizon conforms to PMM Attribute Schema v1.0. Field details below; see `PMM_ATTRIBUTE_SCHEMA_v1.md` for the full canonical contract.

All PMM attributes live in a single dictionary: `PMM`.

### Layer 1 — Identity & Sync

Universal. Auto-managed.

| Field | Owner | Purpose |
|---|---|---|
| PMM ID | Plugin (set once) | UUID v4. Stable forever. |
| Buildertrend ID | Relay | Set after first BT push |
| Sync Status | Relay | Not Synced / Pushed / Pulled / Modified / Conflict |
| Last Modified | Plugin | ISO timestamp, last edit |
| Last Synced | Relay | ISO timestamp, last BT round-trip |
| Last Pushed to Sheet | Horizon | ISO timestamp, last Sheet push |

PMM Horizon writes `PMM ID`, `Last Modified`, `Last Pushed to Sheet`. Other Layer 1 fields are managed by Relay and read-only here.

### Layer 2 — Model

Universal. Some auto-derived, some user-editable via Connection.

| Field | Owner | Purpose |
|---|---|---|
| Component Name | Plugin (auto) | SketchUp definition name |
| Component Type | Plugin (user) | Friendly type ("Wall", "Door") |
| IFC Class | Plugin (auto) | IFC class (`IFCWALL`) |
| Instance GUID | Plugin (auto) | SketchUp internal GUID |
| Length | Plugin (auto) | Bounding box, decimal inches |
| Width | Plugin (auto) | Bounding box, decimal inches |
| Height | Plugin (auto) | Bounding box, decimal inches |
| Quantity | Plugin (user) | Default 1 |
| Location | Plugin (user) | Room/space tag |
| Storey | Plugin (user) | "1", "2", "B", "R", etc. |
| Status | Plugin (user) | Concept / Approved / Construction / etc. |
| Project Phase | Plugin (user) | SD / DD / CDs / etc. |
| Review Notes | Plugin (user) | Free-form designer notes |

> **AUTO-REFRESH ON EVERY PUSH**
> `Component Name`, `Instance GUID`, `Length`, `Width`, `Height` auto-refresh on every push, so they stay in sync with the live model. Don't try to set them manually.

### Layer 3 — Commercial

Universal. Sheet-owned. PMM Horizon reads only, via Pull.

20 fields including `Title`, `Description`, `Cost Category`, `Cost Code`, `Cost Type`, `Selection Category`, `Unit`, `Unit Price`, `Amount`, `Allowance`, `Vendor`, `Deadline`, `Instructions`, `Selections Notes`, `Scope of Work`, `PO Date`, `PO Notes`, `Group`, `Image URL`, `Notes`.

### Layer 4 — Type-specific

Conditional. Set by PMM Connection's Inspector. PMM Horizon pushes them to the Sheet (in their respective columns) but doesn't edit them.

For walls: `Wall Assembly`, `Interior Finish`, `Exterior Finish`, `Fire Rating`, `STC Rating`, `Insulation Type`, `R-Value`. For doors: `Door Size`, `Door Material`, `Frame Material`, `Handing`, `Fire Rated`, `Finish`, `Hardware Group`, `Lockset Spec`. See the schema editor in PMM Connection or the spec document for full lists.

### Naming convention

All keys are Title Case With Spaces. `Fire Rating`, not `fire_rating`. The exception: legacy compatibility mirrors are kept alongside canonical names so older tooling continues to work through v0.5.0.

### Validation

```ruby
inst = Sketchup.active_model.selection.first
puts inst.attribute_dictionary('PMM').to_a.sort.map {
 |k, v| " #{k}: #{v}"
}
```

Run this in the Ruby Console (**Window → Ruby Console**) to see every PMM attribute on a selected component.

---

## 12. Sheet Structure

When PMM Horizon creates or links to a project Sheet, the structure is:

### `_Index` tab

The lookup table. One row per PMM-tagged component, internal plumbing:

| Column | Purpose |
|---|---|
| pmm_uuid | Component's `PMM ID` |
| component_name | For human readability |
| tab_name | Which category tab holds the data row |
| row_number | Row index in that tab |
| cost_category | Redundant with `tab_name`, useful for filtering |
| status | `active` or `deleted` (soft-delete flag) |
| first_seen_at | ISO timestamp |
| last_updated_at | ISO timestamp |

The `_Index` tab uses snake_case column headers (per spec §8 — internal plumbing).

### `_Meta` tab

Two-column key/value pairs:

| Key | Value Example |
|---|---|
| project_name | "25 Hickory Lane" |
| bt_job_id | (set when Relay first pushes to BT) |
| schema_version | 1.0 |
| created_at | ISO timestamp |
| created_by | "PMM Horizon" |

### Category tabs

One per Cost Category in your model. Tab name matches the `Cost Category` field exactly: `06 - Carpentry`, `26 - Electrical`, etc. Each row represents one component. Column headers are Title Case (`PMM ID`, `Component Name`, `Cost Code`, `Unit Price`, etc.).

Components without a Cost Category value go to a special `_Uncategorized` tab.

### Moving components between tabs

If you change a component's `Cost Category` in SketchUp and re-push, the row moves between tabs automatically. The plugin handles delete-from-old-tab + insert-into-new-tab as one atomic operation.

---

## 13. Configuration & OAuth

### OAuth Client ID

PMM Horizon uses OAuth 2.0 with PKCE (no client secret needed). The Trilogy production Client ID is baked into the plugin code at `pmm_bridge_exporter/sheets_sync.rb`:

```
436975636819-rd7s1lfjc4rl73i8ted6ojv9n7gmfiik.apps.googleusercontent.com
```

For testing/dev, override with the env var `PMM_DRIVE_CLIENT_ID`.

### Token storage

OAuth refresh tokens are stored at:

| OS | Path |
|---|---|
| macOS | `~/.pmm_bridge/drive_token.json` |
| Windows | `%USERPROFILE%\.pmm_bridge\drive_token.json` |

Delete this file to force re-authentication.

### Project link storage

The link between a SketchUp model and its Google Sheet is stored as a model-level attribute (in the model's `pmm_horizon_link` dictionary). The link travels with the `.skp` file — share the file, and the recipient's PMM Horizon can push to the same Sheet (assuming they have OAuth access).

### Per-team config

For shared workflows, the OAuth Client ID and (rarely) custom scopes can be customized in `sheets_sync.rb`. This is rare — the defaults work for almost all installations.

---

# Part Four — Practical Notes

Troubleshooting, file locations, and credits.

---

## 14. Troubleshooting

### "I don't see the PMM Horizon menu after installing"

- Verify SketchUp restarted after the install
- **Extensions → Extension Manager** → confirm "PMM Horizon" appears as enabled
- On older SketchUp versions, the menu lives under **Plugins** instead of **Extensions**

### "The OAuth browser window doesn't appear when I try to push"

- Verify your browser isn't blocking the redirect to `localhost`
- Try **Sign Out of Google** then re-attempt — sometimes a stale token gets in the way
- Check firewall isn't blocking SketchUp's outbound HTTPS

### "OAuth completes but the plugin says 'Permission denied'"

This means the OAuth succeeded but the Sheet itself isn't shared with you (or with the OAuth account you used).

- Confirm the Sheet's owner has shared it with you (Editor permissions)
- Re-link the model with the correct Sheet ID

### "Push fails with 'Quota exceeded'"

Google enforces 300 reads/min and 60 writes/min per Sheet. On a model with thousands of components, the first push may run up against the write quota.

- Wait 60 seconds, run **Flush Auto-Push Queue Now**
- For very large models, push in batches via **Push Selection** instead of full-model

### "I see legacy snake_case column headers in my Sheet"

Run **Extensions → PMM Horizon → Migrate Linked Sheet to Schema v1.0**. The data rows are unchanged; only column headers update.

### "Auto-Push isn't pushing changes"

- Verify Auto-Push is ON: **Extensions → PMM Horizon → Toggle Auto-Push** should show ☑
- Check the status bar — it logs *PMM Horizon: synced N row(s)* after each flush
- The 5-second debounce means changes aren't pushed instantly — wait at least 5 seconds after your last edit
- **Flush Auto-Push Queue Now** forces an immediate push if you don't want to wait

### "I tagged a component but it didn't get pushed"

- Verify the component has `Component Type` set
- Verify it's a `ComponentInstance`, not a Group — Groups don't carry component-level PMM attributes
- Run **Audit Missing UUIDs** to see which tagged components are missing a `PMM ID`

### "I deleted a component in SketchUp but its row is still in the Sheet"

That's by design — soft delete. Run **Push to Google Sheet (Full Model)**; the plugin will detect the missing component and mark its `_Index` row `status: deleted`. The row data stays for audit; no data loss.

To purge soft-deleted rows from the Sheet, do it manually in Google Sheets — the plugin doesn't auto-purge.

### "Two designers pushed the model at the same time and the Sheet looks weird"

Last write wins per cell. Re-push from one designer's machine to restore consistency.

### "I want to roll back to the previous Schema before migration"

If you ran **Migrate Model to Schema v1.0** and want to undo:

- One immediate Undo (Cmd-Z / Ctrl-Z) reverts the migration
- After saving and reopening the file, undo no longer works — but legacy `pmm_bridge` data is still preserved through v0.5.0, so re-running with an older plugin version works

### Ruby Console diagnostics

**Window → Ruby Console**

Useful one-liners:

```ruby
# What's on the selected component?
sel = Sketchup.active_model.selection.first
puts sel.attribute_dictionary('PMM').to_a.sort.map {
 |k, v| "#{k}: #{v}"
}

# How many PMM-tagged components are in this model?
n = 0
Sketchup.active_model.entities.each do |ent|
 next unless ent.is_a?(Sketchup::ComponentInstance)
 n += 1 if ent.get_attribute('PMM', 'Component Type', nil)
end
puts "PMM-tagged at root: #{n}"

# Schema version of this model
puts Sketchup.active_model.get_attribute(
 'pmm_horizon_link', 'schema_version', '(none)')

# Linked Sheet ID
puts Sketchup.active_model.get_attribute(
 'pmm_horizon_link', 'sheet_id', '(not linked)')
```

---

## 15. System Requirements & File Locations

### Requirements

- SketchUp 2021 or newer (Pro or Studio; Free/web not supported)
- macOS or Windows
- Ruby 2.5+ (built into SketchUp 2021+)
- Internet connection for Sheet sync

### File locations

The plugin installs to SketchUp's per-user plugins directory.

| OS | Path |
|---|---|
| macOS | `~/Library/Application Support/SketchUp 20XX/SketchUp/Plugins/pmm_bridge_exporter/` |
| Windows | `%APPDATA%\SketchUp\SketchUp 20XX\SketchUp\Plugins\pmm_bridge_exporter\` |

(Replace `20XX` with your SketchUp year version.)

OAuth tokens at `~/.pmm_bridge/drive_token.json` (both OS).

> **WHY THE FOLDER IS NAMED pmm_bridge_exporter**
> The plugin is registered as "PMM Horizon" in Extension Manager. The internal folder name `pmm_bridge_exporter` is preserved for backwards compatibility — renaming it would orphan saved preferences and break existing installations.

### Inside that folder

- Ruby modules (`*.rb`) — the plugin code
- `oauth_config.rb` — local override for OAuth Client ID (optional)
- `assets/` — branded UI assets

No data files are stored in the plugin directory. PMM data lives on components in the `.skp` file. OAuth tokens live in the user home directory.

---

## 16. Credits

PMM Horizon is part of the **PMM Tools** suite by **Trilogy Design Intelligence**, a service of **Trilogy Partners**.

- **Design and requirements** — Trilogy Design Intelligence
- **Implementation** — Claude (Anthropic)
- **Questions or issues** — christianah@trilogybuilds.com

This guide and the plugin both follow the **PMM Attribute Schema v1.0** — the canonical contract shared across PMM Connection, PMM Horizon, PMM in the Sky, PMM on the Ground, PMM Compass, PMM Bridge, and PMM Relay.

For schema details, see the PMM Attribute Schema v1.0 specification.

PMM Horizon User Guide — version matched to plugin **v0.4.0**.

---

*Trilogy Design Intelligence  ·  PMM Horizon User Guide  ·  v0.4.0*
*Trilogy Partners. Boots on the Ground, Eyes on the Sky.*
