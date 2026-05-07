# PMM Connection

**Bridging Revit, SketchUp, and Buildertrend**

*Created by Trilogy Partners using Trilogy Build Intelligence.*
*Boots on the Ground, Eyes on the Sky.*

**Version 0.17.1 · Schema v1.0 aligned**
**Audience:** Designers · BIM Coordinators · Architects · Builders

---

## Contents

**Part One — Quick Start**
1. What PMM Connection Does
2. Installation
3. Your First Sync
4. Anatomy of a Tagged Element

**Part Two — Core Workflows**
5. The PMM Picture
6. Sync IFC Metadata into SKP
7. Tag Design Elements
8. The PMM Inspector
9. The Tag Scheme
10. Export Report

**Part Three — Reference**
11. Menu Reference
12. PMM Schema v1.0
13. Auto-Suggest Patterns
14. Configuration Files

**Part Four — Practical Notes**
15. Troubleshooting
16. System Requirements & File Locations
17. Credits

---

# Part One — Quick Start

## 1. What PMM Connection Does

PMM Connection is a SketchUp extension that bridges three places construction information lives: a Revit BIM model, a SketchUp design model, and Buildertrend's commercial systems.

A typical project flow at Trilogy:

1. The architect delivers a Revit-exported SketchUp file (good geometry) and a matching IFC sidecar (rich metadata).
2. PMM Connection matches each SketchUp element to its IFC twin and writes structured PMM data onto the component.
3. Designers add and tag everything the architect didn't include — furniture, fixtures, decor, finishes — directly in SketchUp.
4. PMM Horizon (a separate tool) pushes the model to a Google Sheet linked to Buildertrend.
5. Buildertrend gets clean cost categories, vendors, and selections from the model itself.

PMM Connection's job is everything in steps 1–3. It never talks to Buildertrend directly.

> **AUDIENCE** — This guide is for both Trilogy team designers and external collaborators (architects, builders, BIM coordinators). Internal-only details are flagged when they appear.

## 2. Installation

You need SketchUp 2021 or newer. The plugin works on macOS and Windows.

### Install steps

1. Extensions → **Extension Manager**
2. Click **Install Extension…** at the bottom-left
3. Choose `pmm_connection.rbz`
4. SketchUp will warn that the extension is not signed by Trimble — click **Yes** to proceed
5. Restart SketchUp

After restart, look for **Extensions → PMM Connection** in the menu bar. On older SketchUp versions this appears as **Plugins → PMM Connection**.

### Updating

To install a newer version:

1. Extension Manager → find the existing PMM Connection entry
2. Click **Uninstall**
3. Restart SketchUp
4. Install the new `.rbz` (steps 1–5 above)

> **TAGGED DATA IS PRESERVED** — Tagged data on existing models survives plugin updates. Configuration files (schema, types, tag scheme) are also preserved across updates.

## 3. Your First Sync

The fastest path to seeing PMM Connection work: open a Revit-exported SketchUp file with its matching IFC, run the Sync, and watch.

### What you need

- An `.skp` file exported from Revit (architect's deliverable)
- The matching `.ifc` file (same project, same export)

These two files together are the input. The plugin matches SketchUp groups/components to their IFC counterparts and writes metadata onto the SKP.

### Run the sync

1. Open the `.skp` file in SketchUp
2. Extensions → PMM Connection → **Sync IFC Metadata into SKP…** (recommended)
3. Pick the `.ifc` file when prompted
4. A progress dialog appears showing parse progress
5. When matching finishes, a Review dialog appears showing every SketchUp element with its proposed IFC match
6. Auto-matched rows (100% confidence — same GlobalId) are pre-checked
7. Review any uncertain matches near the top of the list
8. Click **Apply Selected Matches** at the bottom
9. A Tag Preview dialog appears showing every tag about to be created (`Wall_1`, `Door_2`, etc.) grouped by Division folder. Rename or skip any individual tag, then **Apply Tags**

### What just happened

For each matched element, the plugin wrote about 15 attributes to a single dictionary called `PMM`:

- Identity fields (`PMM ID`, `GlobalId`, `Name`, `Storey`)
- Component metadata (`Component Type`, `IFC Class`, `Component Name`, `Length`, `Width`, `Height`)
- Workflow state (`Status`, `Project Phase`, `Sync Status`, `Schema Version`)
- Type-specific fields (Wall Assembly, Fire Rating, etc. for walls; Door Material, Handing for doors)
- Property sets from IFC (`Pset:Pset_WallCommon::IsExternal`, etc.)

You can see all of this on any selected element via Window → Entity Info (collapsed) or the PMM Inspector (richer view).

## 4. Anatomy of a Tagged Element

Open the **PMM Inspector** (Extensions → PMM Connection → PMM Inspector) and click any group or component in your model. The Inspector shows what's stored on that element, organized into sections that match the PMM Schema v1.0 layers:

### Identity (always shown)

`Component Type`, `IFC Class`, `PMM ID`, `GlobalId`, `Storey`, `Schema Version`. Most are auto-managed.

### Type-specific fields

Vary by what kind of element this is. For a Wall: Wall Assembly, Fire Rating, Insulation Type, R-Value, etc. For a Door: Door Material, Handing, Hardware Group, Lockset Spec, etc. These are editable.

### IFC Property Sets

Read-only mirror of the original IFC Pset data, collapsed by default. Useful for verifying source-of-truth values (like `Pset_WallCommon::FireRating`).

### Commercial

The bottom section, populated by PMM Horizon when the component is pushed to the linked Google Sheet. Shows commercial state: Title, Vendor, Unit Price, Amount, Allowance, Cost Category — all read-only inside Connection.

If a component has never been pushed to Horizon, the Commercial section shows "No data from Horizon yet."

Edits to type-specific fields and workflow state (Status, Project Phase, Review Notes, Quantity, Location) save automatically as you type. The check mark next to each field confirms the save.

---

# Part Two — Core Workflows

## 5. The PMM Picture

Before walking through the operations one by one, here's the mental model:

```
Architect's Revit model
        │
        ├── exports SKP ──┐
        │                 │
        └── exports IFC ──┤
                          │
        ┌─────────────────┴─────────────────┐
        │     PMM CONNECTION (here)         │
        │                                   │
        │   1. Sync IFC into SKP            │
        │   2. Tag Design Elements          │
        │   3. Inspector edits              │
        │                                   │
        └─────────────────┬─────────────────┘
                          │
                          ▼
              PMM Horizon (separate tool)
                          │
                          ▼
              Google Sheet (PMM in the Sky)
                          │
                          ▼
                    Buildertrend
```

Connection is the leftmost stage — getting the model populated with structured data. Horizon takes that data to the Sheet. Other tools handle the Sheet ↔ Buildertrend round-trip.

The currency that flows through all stages is the **PMM ID** — a UUID stamped onto each component the first time it's tagged. That ID survives every export, push, pull, and round-trip. It's how every system knows that "this Sheet row belongs to this SketchUp component belongs to this Buildertrend line item."

### The three tagging operations

There are three different ways elements get PMM data, depending on where they came from:

| Where it came from | How to tag it |
| --- | --- |
| Architect's IFC | Sync IFC Metadata into SKP |
| Designer-placed in SketchUp | Tag Design Elements |
| Already tagged in an old import | Migrate Legacy IFC Tags |

In a typical luxury residential project all three apply — architects deliver mixed construction + design content, designers add staging and decor on top, and you may inherit older models. The next sections walk through each.

## 6. Sync IFC Metadata into SKP

The primary workflow. Run this whenever you receive a fresh Revit deliverable.

### When to use

- You just received an updated SKP + IFC pair from the architect
- You re-imported the model and want to refresh PMM data
- You added new Revit-sourced elements via a delta import

### How matching works

The matcher uses three tiers of confidence:

1. **GlobalId match (100%)** — Revit's exported SketchUp file names instances using IFC GlobalIds (often suffixed with `#1`, `#2` for repeated instances). When the SKP element name and the IFC GlobalId match, the link is certain.
2. **Revit Element ID (100%)** — some exports include bracketed IDs like `[485302]` in the instance name. Same confidence as GlobalId.
3. **Fuzzy fallback** — for the remaining elements, score by name similarity and bounding-box position. A confidence number is shown so you can review.

In practice, on a typical Revit deliverable, 90–98% of elements match at 100% via tier 1. The remaining few you eyeball.

### Step by step

1. **Pick the IFC file.** A standard file picker opens. Navigate to the IFC sidecar.
2. **Watch parsing.** A progress bar appears. On a 50 MB IFC (~3,000 products) this takes 30–60 seconds. The dialog stays responsive — no beach balls.
3. **Review matches.** The dialog has two sections. The left shows IFC products with their type, GlobalId, and storey. The right shows your SKP elements with their proposed match. Confidence percentages and tier indicator are visible per row. Use the search box to filter, the type filter to narrow by IFCWALL/IFCDOOR/etc.

Three actions per row:

- **Accept** (default for 100% matches) — write the IFC's metadata to the SKP element
- **Skip** — leave this SKP element untouched
- **Pick a different IFC** — manually choose from a dropdown

4. **Apply Selected Matches.** This writes PMM attributes for each accepted match. Non-tag work happens here in one undo step.
5. **Tag Preview.** A second dialog appears showing every tag about to be created. Each row has a folder pill (Shell, Structure, Openings, …) — the Division this Tag will live under, the Tag name as resolved from your Tag Scheme (`Wall_1`, `Door_R`, …), an element count for that tag, an editable text input — rename the tag if you want, and a checkbox — uncheck to skip creating this tag (the elements still got PMM data, they just won't be assigned to a SketchUp Tag).

Click **Apply Tags** when satisfied. This creates folders + tags + assignments in a second undo step.

> **TWO UNDO STEPS, NOT ONE** — Pressing Cmd-Z (or Ctrl-Z) once will undo only the tag creation; pressing it again undoes the metadata write. We split into two steps because you can cancel between them — if you cancel the Tag Preview, your PMM data is still saved.

### Replace-existing tags

Before the apply runs, you may be asked whether to replace existing SketchUp Tag assignments. Three options exist for this preference (Edit Tag Scheme): always replace, never replace, ask each time. Default is "ask."

### Storey is not always present

If an element has no `IFC/Storey` attribute, the Tag falls back to just the type (e.g. `Wall` instead of `Wall_1`). This matches your "leave it blank, I'll fill in manually" preference.

## 7. Tag Design Elements

The complement to Sync. After the IFC sync handles construction elements, this handles everything else: furniture, fixtures, lighting, decor — anything the architect placed but didn't include in their IFC export.

### When to use

- After Sync, to tag the leftover untagged elements
- On a SKP where there's no IFC at all (interior designer working from existing models)
- When you've added new components to the model and want them PMM-tagged

### The dialog

Top toolbar:

- **By Definition / By Instance** segmented toggle. Definition mode collapses repeated components (48 recessed lights → 1 row). Instance mode shows every placed element separately.
- **Include already-tagged** — off by default. Turn on to also see PMM-tagged elements (for re-tagging or fixing).
- **Filter** — searches across element name, material, parent group path, and current Tag.

Each row shows:

- **Checkbox** — included in Apply
- **Zoom button (🔍)** — zooms SketchUp's camera to that element so you can visually identify it before assigning a type
- **Thumbnail** — auto-rendered from the SketchUp ComponentDefinition (plain Groups show a placeholder)
- **Element info** — definition name, material with paint icon, parent group breadcrumb path, instance count
- **Current Tag** — what Tag (if any) the element is currently on
- **PMM Type** — dropdown to assign a friendly type. Auto-suggestions appear with a gold "(auto-suggest)" hint based on name patterns

### Auto-suggest

The plugin matches element names against 60+ patterns:

| Name contains | Suggested type |
| --- | --- |
| `pendant`, `chandelier`, `sconce`, `recessed` | Light Fixture |
| `range`, `oven`, `dishwasher`, `refrigerator` | Built-in Appliance |
| `cabinet`, `vanity`, `cabinetry`, `millwork` | Cabinet |
| `toilet`, `sink`, `tub`, `shower`, `faucet` | Plumbing Fixture |
| `sofa`, `chair`, `table`, `bed` | Furniture |
| `rug`, `art`, `vase`, `decor` | Decor |
| `mirror`, `fireplace`, `countertop` | (specific selection types) |
| `wall`, `floor`, `roof`, `ceiling` | (Shell types) |

The full pattern list is in section 13. Auto-suggest fills the dropdown with the suggested type and pre-checks the row. You can override any suggestion via the dropdown, or skip the row entirely by unchecking it.

### Bulk operations

- **Set all visible rows to:** dropdown + Apply to visible — assign one type to every row currently passing the filter
- **Check all visible / Uncheck all visible** — bulk toggle inclusion

A common pattern: filter for "light," bulk-assign to Light Fixture, click Apply to visible. Then filter for "rug," bulk-assign to Rug. Then click **Apply to Checked** at the bottom.

### Apply

Apply to Checked writes PMM attributes, applies schema defaults (so a newly-tagged Wall gets default Fire Rating: None, etc.), and assigns SketchUp Tags via your current Tag Scheme. One undo step.

## 8. The PMM Inspector

The Inspector is a live, selection-driven attribute editor. It updates as you click around in SketchUp.

### Opening

Extensions → PMM Connection → **PMM Inspector**. The dialog stays open until you close it. You can keep it docked while working in SketchUp.

### Single selection

Click any group or component. The Inspector shows that element's PMM data organized into sections (see section 4 — Anatomy of a Tagged Element).

### Multi-selection

Select multiple elements. The Inspector shows fields shared across all of them. Where values agree, the value appears. Where values differ, you'll see "— multiple values —" and the field is in a special state.

Editing a field on a multi-selection writes the new value to all selected elements. The first edit in a multi-selection prompts you to confirm "Apply to all 12 selected elements?" Once confirmed for that selection, subsequent edits don't ask again until the selection changes.

### Editing

Most fields are direct text inputs or dropdowns. Edits commit when you tab/click away from the field. A green check mark briefly appears to confirm the save.

Read-only fields (PMM ID, GlobalId, Schema Version, Length, Width, Height, Component Name, Instance GUID, all of Commercial) display as plain text without an input. These are auto-managed.

### Layer 2 model fields auto-refresh

Every time you open the Inspector or run any PMM operation, these derived fields are refreshed from the live model:

- **Component Name** — mirrors the SketchUp ComponentDefinition name
- **Instance GUID** — SketchUp's per-entity GUID
- **Length, Width, Height** — bounding box dimensions in inches (displayed in feet-inches: `8'-0"`)

So if you scale or rename a component, the next time you click on it the Inspector updates without needing to retag.

### Location autocomplete

The Location field (room/space tag — "Master Bath", "Kitchen") is a free-text input with an autocomplete datalist. Suggestions come from existing Location values used elsewhere in the same model. Helps designers reuse names without retyping or needing a fixed taxonomy.

### Commercial section

Read-only display of Layer 3 commercial fields populated by PMM Horizon. Connection never writes these. The header subtitle shows when the component was last pushed to the Sheet (gold text), or "No data from Horizon yet" (muted) if not yet pushed.

## 9. The Tag Scheme

The Tag Scheme controls how SketchUp Tag names are constructed when PMM Connection creates them.

### Edit Tag Scheme dialog

Extensions → PMM Connection → **Edit Tag Scheme…**

### Template

A string with placeholders. Default is `{type}_{storey}` which produces `Wall_1`, `Door_2`, etc. Examples:

| Template | Produces |
| --- | --- |
| `{type}_{storey}` | `Wall_1`, `Door_2` |
| `{storey}-{type}` | `1-Wall`, `2-Door` |
| `{type}` | `Wall`, `Door` (storey ignored) |
| `Storey {storey} - {type}` | `Storey 1 - Wall` |

A live preview at the bottom of the Template card shows a few sample tags using your current model's data.

### Storey labels

Auto-extracted labels per storey, with optional user override. The plugin extracts numbers and letter codes from Revit storey names:

| Revit storey name | Auto-label |
| --- | --- |
| Level 1, 01 - Entry, Floor 1 | 1 |
| Level 2, Floor 2 | 2 |
| Basement | B |
| Sub-Basement | SB |
| Ground Floor, Main Level, Entry Level | G |
| Mezzanine | M |
| Roof | R |
| Attic, Loft | A |
| Penthouse | PH |
| Crawl Space | CS |

If you want an override (e.g. Ground Floor → 1 instead of G), enter your preferred label in the Override column. The override applies to all elements on that storey for all future tagging.

### When tagging runs

Three options:

- **Ask me each time** (default) — every tagging operation asks whether to replace existing tags
- **Always replace existing tags** — no prompt; new tags overwrite old assignments
- **Never replace existing tags** — only assign tags to elements currently on the default (Untagged) layer; respects user organization

### Division folders

Tag names live inside Tag Folders. The folder is named after the element's Division (Shell, Structure, etc.) — derived from the Types registry. The plugin creates folders on demand and adds new tags to them.

If you've manually moved a tag into a custom folder, the plugin won't move it back. Customization is preserved.

If your SketchUp version doesn't support Tag Folders (pre-2021), tags are created flat. The plugin auto-detects this and falls back gracefully.

### Clean Up PMM Tags

This menu item exists for fixing legacy data. It walks every PMM-tagged element and re-applies the current Tag Scheme — useful when:

- You changed your Tag Scheme template after tagging
- An old import created ugly GUID-named tags
- You want to re-organize tags into Division folders after upgrading

Clean Up doesn't touch PMM attribute data; it only renames/reassigns SketchUp Tags. After running, open the Tags panel → right-click → Purge Unused to remove the now-empty old tags.

## 10. Export Report

PDF schedule of PMM data, useful for client meetings, subcontractor handoff, and design reviews.

### Two scopes

- **From Selection** — generate a report for whatever you've selected in the model
- **Full Model** — every PMM-tagged element

Both go through the same dialog flow.

### Column picker

After picking the scope, a column picker appears. The plugin lists every available PMM attribute, grouped by category (Identity, Schema, Type-specific by IFC class, Psets). Check the columns you want in the report. The picker remembers your last selection.

You can also enter a Project Name at the top of the picker — appears as the report title.

### Preview

The preview opens as a styled PDF preview inside SketchUp. The Trilogy header, project name, and full schedule render in a portrait or landscape layout.

Footer buttons:

- **‹ Back to Columns** — returns to the picker with your previous column selection still checked
- **Cancel** — close without exporting
- **Print / Save as PDF** — opens your OS print dialog. Pick "Save as PDF" as the printer to save a file

The Project Name and your column selection are saved to disk, so the next time you open Export Report it pre-fills with your last setup.

---

# Part Three — Reference

## 11. Menu Reference

All items live under **Extensions → PMM Connection** (or Plugins on older SketchUp).

| Menu item | What it does |
| --- | --- |
| Sync IFC Metadata into SKP… | Primary: match SKP elements to IFC, write PMM data, create tags |
| Import IFC Model (geometry-only)… | Standalone IFC importer (use only if no matching SKP exists) |
| PMM Inspector | Open the live attribute editor |
| Edit PMM Schema… | Customize what attribute fields appear per type |
| Edit Tag Scheme… | Customize tag naming + storey labels + replace preference |
| Migrate Legacy IFC Tags… | Upgrade old IFC-imported elements to PMM v1.0 format |
| Clean Up PMM Tags… | Re-apply current Tag Scheme to all PMM-tagged elements |
| Tag Design Elements… | Bulk-tag designer-placed content (furniture, fixtures, etc.) |
| Export Report → From Selection | PDF schedule of selected elements |
| Export Report → Full Model | PDF schedule of all PMM-tagged elements |

### Right-click context menu

Right-click any group/component in SketchUp:

```
PMM → Assign Type → [Division] → [Type]
```

Quick-tag a single element or a multi-selection without going through Tag Design Elements. Always overwrites — assumes you explicitly want this tag. Storey-aware when the element has a Storey attribute.

## 12. PMM Schema v1.0

PMM Connection conforms to the **PMM Attribute Schema v1.0** — the canonical contract that all PMM Tools share.

All PMM attributes live in a single SketchUp dictionary called `PMM`. The model itself has a separate `PMM Model` dictionary for whole-file metadata.

The schema has four layers:

- **Layer 1 — Identity & Sync** — universal, auto-managed
- **Layer 2 — Model** — universal, mixed auto/user
- **Layer 3 — Commercial** — Sheet-owned, display only
- **Layer 4 — Type-specific** — conditional

### Layer 1 — Identity & Sync

Universal. Auto-managed.

| Field | Owner | Purpose |
| --- | --- | --- |
| PMM ID | Plugin (set once) | UUID v4. Stable forever. |
| Buildertrend ID | Relay | Set by sync tools after first BT push |
| Sync Status | Relay | Not Synced / Pushed / Pulled / Modified / Conflict |
| Last Modified | Plugin | ISO timestamp, last edit |
| Last Synced | Relay | ISO timestamp, last BT round-trip |
| Last Pushed to Sheet | Horizon | ISO timestamp, last Sheet push |
| Schema Version | Plugin | 1.0 |

Connection writes `PMM ID`, `Last Modified`, `Schema Version`, `Sync Status` (initialized to `Not Synced`). Other Layer 1 fields are read-only.

### Layer 2 — Model

Universal. Some auto-derived, some user-editable.

| Field | Owner | Purpose |
| --- | --- | --- |
| Component Name | Plugin (auto) | SketchUp component definition name |
| Component Type | Plugin (user) | Friendly PMM type ("Wall", "Door") |
| IFC Class | Plugin (auto) | IFC class mapping (IFCWALL) |
| Instance GUID | Plugin (auto) | SketchUp's internal entity GUID |
| Length | Plugin (auto) | Bounding box, decimal inches |
| Width | Plugin (auto) | Bounding box, decimal inches |
| Height | Plugin (auto) | Bounding box, decimal inches |
| Quantity | Plugin (user) | How many this instance represents (default 1) |
| Location | Plugin (user) | Room/space tag with autocomplete |
| Storey | Plugin (user) | "1", "2", "B", "R", "Crawl", etc. |
| Status | Plugin (user) | Concept / Pending Review / Approved / Revised / Construction / Installed / As-Built |
| Project Phase | Plugin (user) | Schematic Design / Design Development / CDs / Bidding / Construction Administration |
| Review Notes | Plugin (user) | Free-form designer notes |

> **AUTO-REFRESH ON EVERY OPERATION** — `Component Name`, `Instance GUID`, and bounding-box dimensions auto-refresh on every Inspector open and PMM operation, so they stay in sync with the live model.

### Layer 3 — Commercial

Universal. Sheet-owned, Connection displays only.

20 fields populated by PMM Horizon when a component is pushed to the linked Google Sheet. Includes Title, Description, Cost Category, Cost Code, Cost Type, Selection Category, Unit, Unit Price, Amount, Allowance, Vendor, Deadline, Instructions, Selections Notes, Scope of Work, PO Date, PO Notes, Group, Image URL, Notes.

These appear in the Inspector's Commercial section (read-only). They never get edited or written by Connection.

### Layer 4 — Type-specific

Conditional. Only present for specific component types.

For walls: Wall Assembly, Interior Finish, Exterior Finish, Fire Rating, STC Rating, Insulation Type, R-Value.

For doors: Door Size, Door Material, Frame Material, Handing, Fire Rated, Finish, Hardware Group, Lockset Spec.

For windows, floors, roofs, cabinets/fixtures/appliances — see the schema editor or the spec document for full lists.

### Naming convention

All keys are Title Case With Spaces. `Fire Rating`, not `fire_rating`. The exception: legacy compatibility mirrors (`Type`, `IFCClass`) are kept alongside the canonical names so older tooling continues to work.

### Validation

```ruby
inst = Sketchup.active_model.selection.first
puts inst.attribute_dictionary('PMM').to_a.sort.map {
  |k, v| "  #{k}: #{v}"
}
```

Run this in the Ruby Console (Window → Ruby Console) to see every PMM attribute on a selected element.

### Visual schema editor

The **Edit PMM Schema…** menu item opens a visual editor for `pmm_schema.json`. You can add fields, change defaults, modify enum options, mark fields readonly, and reset to defaults. Changes save immediately to the JSON.

Universal fields apply to every PMM-tagged element; per-type fields only apply when an element is tagged with that type.

## 13. Auto-Suggest Patterns

The Tag Design Elements dialog uses these regex patterns (case-insensitive) to suggest a PMM type from element/component names. Patterns are evaluated top to bottom; the first match wins.

| Type | Pattern |
| --- | --- |
| Plumbing Fixture | `toilet \| lavatory \| sink \| bidet \| urinal` · `bath(tub)? \| shower \| tub` · `faucet \| tap \| shower-head` |
| Light Fixture | `pendant \| chandelier \| sconce \| recessed light` · `ceiling light \| wall light \| track light` · `lamp \| lantern \| lighting \| luminaire \| fixture` |
| Built-in Appliance | `range \| cooktop \| wall oven \| microwave \| vent hood` · `dishwasher \| refrigerator \| fridge \| freezer` · `wine cooler \| washer \| dryer \| laundry` |
| Cabinet | `cabinet \| vanity \| cabinetry \| millwork \| built-in` |
| Countertop | `counter(top)? \| island` |
| Mirror | `mirror \| vanity-mirror` |
| Hardware | `hardware \| knob \| pull \| hinge` |
| Fireplace | `fireplace \| firebox \| mantel` |
| Garage Door | `garage.*door \| overhead.*door` |
| Door | `door \| doorway \| entry \| entrance` |
| Skylight | `skylight \| rooflight` |
| Window | `window \| casement \| awning \| picture-window` |
| Column | `column \| post \| pillar` |
| Beam | `beam \| girder \| lintel` |
| Joist | `joist \| rafter` |
| Header | `header` |
| Stair | `stair \| staircase \| step` |
| Railing | `railing \| guardrail \| balustrade \| handrail` |
| Ramp | `ramp` |
| Wall | `wall` |
| Floor | `floor \| slab \| subfloor` |
| Ceiling | `ceiling` |
| Roof | `roof \| roofing` |
| Foundation | `foundation \| footing` |
| Trim | `trim \| baseboard \| crown \| casing \| molding` |
| Paneling | `paneling \| wainscot \| shiplap` |
| Retaining Wall | `retaining-wall` |
| Deck | `deck \| patio-deck` |
| Pool | `pool \| spa` |
| Landscape | `landscape \| plant \| tree \| shrub` |
| Hardscape | `hardscape \| paver \| walkway \| patio` |
| HVAC Equipment | `hvac \| ac-unit \| furnace \| boiler \| air-handler` |
| Ductwork | `duct \| ductwork` |
| Piping | `pipe \| piping \| plumbing-pipe` |
| Electrical Panel | `electrical-panel \| breaker-panel \| sub-panel` |
| Rug | `rug \| carpet` |
| Decor | `art \| painting \| sculpture \| vase \| accessor(y\|ies) \| decor` |
| Furniture | `sofa \| couch \| loveseat \| sectional \| settee \| ottoman \| bench` · `chair \| armchair \| stool \| seat` · `table \| desk \| nightstand \| console \| credenza \| dresser` · `bed \| headboard \| bedframe \| mattress` · `bookshelf \| bookcase \| shelf \| shelving \| storage` |

## 14. Configuration Files

The plugin stores settings in three JSON files alongside the Ruby code, in the SketchUp plugins directory:

| File | What's in it | Edit how |
| --- | --- | --- |
| `pmm_schema.json` | Per-type field definitions | Edit PMM Schema… dialog or hand-edit JSON |
| `pmm_types.json` | Friendly type → IFC class registry | Hand-edit JSON |
| `pmm_tag_scheme.json` | Template + storey overrides + replace preference | Edit Tag Scheme… dialog |

These files are good candidates for sharing across a team:

- Copy them between machines to sync conventions
- Check them into version control for project-specific customizations
- The same Connection installation reads them from the same path on every restart

> **SCHEMA MIGRATION** — When Connection v0.17 loads an older `pmm_schema.json`, it automatically appends any missing v1.0 universal fields without disturbing your customizations. Existing per-type fields are preserved verbatim.

---

# Part Four — Practical Notes

## 15. Troubleshooting

### "I don't see the PMM Connection menu after installing"

- Verify SketchUp restarted after the install
- Extensions → Extension Manager → confirm "PMM Connection" appears as enabled
- On older SketchUp, the menu lives under Plugins instead of Extensions

### "macOS shows a beach ball during parsing"

This was a real bug in v0.12.6 and earlier. Versions 0.12.7+ explicitly defer parse work after the progress dialog renders, plus pump events between progress updates. If you still see a beach ball:

- Update to v0.17.x (latest)
- Confirm SketchUp 2021 or newer
- For very large IFC files (>100 MB), expect 1–3 minutes total — no beach ball, but a real wait

### "My tags have GUID names like `0$CAhJ5vD9Qv7FNXqwsefA`"

Old imports (pre v0.13) created tags from raw element names, which were Revit GlobalIds. Run **Clean Up PMM Tags…** to re-apply your current Tag Scheme to all PMM-tagged elements. Then Tags panel → right-click → Purge Unused to remove the empty old tags.

### "Sync IFC says 'No matches' or matches nothing"

- Confirm the IFC file is the actual sidecar of the SKP (same Revit project, exported in the same session)
- Open the IFC in a viewer to verify it has products
- The matcher needs at least one of: GlobalId in element name, Revit Element ID in brackets, or close name+position. Highly customized SKPs may need manual review

### "Tag Design Elements shows GUID-named elements"

Architects sometimes deliver SKPs where instance names are GlobalIds even though the underlying ComponentDefinition has a real name. The dialog now prefers definition name over instance name when picking a primary display, and falls back to material + parent path. If a row still shows `(unnamed)`, use the zoom button to identify the element visually.

### "I changed my Tag Scheme but old tags still have the old names"

Tag Scheme changes don't retroactively rename existing tags. Run **Clean Up PMM Tags…** after changing the scheme to apply the new template to everything that's already tagged.

### "The Inspector shows '— multiple values —' for a field"

You have a multi-selection where elements disagree on that field's value. Editing the field will write the same new value to all selected elements (it confirms first on the first edit per selection).

### "PDF report is blank or missing data"

- Confirm at least one column is selected in the Column picker
- Ensure your scope (Selection or Full Model) actually contains PMM-tagged elements
- Check that the Inspector shows data on a sample element first; if Inspector is empty, the report will be too

### Ruby Console for diagnostics

Window → Ruby Console

Useful one-liners:

```ruby
# What's on the selected element?
sel = Sketchup.active_model.selection.first
puts sel.attribute_dictionary('PMM').to_a.sort.map {
  |k, v| "#{k}: #{v}"
}

# How many PMM-tagged elements are in the model?
n = 0
Sketchup.active_model.entities.each do |ent|
  next unless ent.is_a?(Sketchup::Group) ||
              ent.is_a?(Sketchup::ComponentInstance)
  n += 1 if ent.get_attribute('PMM', 'Component Type', nil)
end
puts "PMM-tagged at root: #{n}"

# Schema version
puts Sketchup.active_model.get_attribute(
  'PMM Model', 'Schema Version', '(none)')
```

## 16. System Requirements & File Locations

### Requirements

- SketchUp 2021 or newer (Pro or Studio; Free/web not supported)
- macOS or Windows
- Ruby 2.5+ (built into SketchUp 2021+)

### File locations

The plugin installs to SketchUp's per-user plugins directory.

| OS | Path |
| --- | --- |
| macOS | `~/Library/Application Support/SketchUp 20XX/SketchUp/Plugins/ifc_importer/` |
| Windows | `%APPDATA%\SketchUp\SketchUp 20XX\SketchUp\Plugins\ifc_importer\` |

(Replace 20XX with your SketchUp year version.)

Inside that folder:

- Ruby modules (`*.rb`)
- Configuration JSON files (`pmm_schema.json`, `pmm_types.json`, `pmm_tag_scheme.json`)
- Brand assets (`assets/trilogy_logo.jpg`)

> **WHY THE FOLDER IS NAMED `ifc_importer`** — The plugin itself is registered as "PMM Connection" in Extension Manager. The internal folder name `ifc_importer` is preserved for backwards compatibility — renaming it would orphan saved preferences and break existing installations.

## 17. Credits

PMM Connection is part of the **PMM Tools** suite by **Trilogy Design Intelligence**, a service of **Trilogy Partners**.

- **Design and requirements** — Trilogy Design Intelligence
- **Implementation** — Claude (Anthropic)
- **Questions or issues** — christianah@trilogybuilds.com

This guide and the plugin both follow the **PMM Attribute Schema v1.0** — the canonical contract shared across PMM Connection, PMM Horizon, PMM in the Sky, PMM on the Ground, PMM Compass, PMM Bridge, and PMM Relay.

For schema details, see the PMM Attribute Schema v1.0 specification.

PMM Connection User Guide — version matched to plugin **v0.17.1**.

---

*Trilogy Design Intelligence · PMM Connection User Guide · v0.17.1*
*Trilogy Partners. Boots on the Ground, Eyes on the Sky.*
