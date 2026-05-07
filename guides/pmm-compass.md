# PMM Compass

**The internal admin rollup — every project, one dashboard.**

*A user guide from the PMM Tools suite by Trilogy Design Intelligence.*

**Tool 04 · v1.0 · Schema v1.0**  

**Audience:** Admins & PMs

---

PMM Compass is the internal admin dashboard. It rolls up data from every active project Sheet into a single view — totals per Cost Category, vendor concentration, missing-field audit, and project completeness. Where principals see the whole portfolio at once.


# Part I — Foundations


## 1. What PMM Compass Is

Compass is a read-only web dashboard served alongside PMM on the Ground (they share the same FastAPI service). It does not change anything — it observes. Three jobs:

- **Aggregate** across projects — total estimate value, totals per Cost Category
- **Audit** for completeness — components missing prices, missing vendors, stale pushes
- **Surface** exceptions — overdue selections, vendor concentration, sync conflicts


## 2. Access

Compass is internal-only. Access via Google Workspace SSO; access is limited to staff in the `trilogy-internal` group. There is no public sign-up.

Open it at `https://pmm.trilogypartners.com/admin`. The same service hosts both `/admin` (Compass) and `/p/{sheet_id}` (on the Ground), so if either is reachable, the other is too.


## 3. Dashboard Layout

Three main areas:

- **Portfolio** — top-strip cards, one per active project, with key health metrics
- **Drill-Down** — pick a project to see its detailed breakdown
- **Cross-Project** — vendor analysis and Cost Category aggregation across all jobs


# Part II — Daily Use


## 4. The Portfolio Strip

The top of the dashboard shows one card per project. Each card answers four questions at a glance:

- What is the total committed budget?
- How many components are missing a price or vendor?
- How many selections are overdue?
- When was the last Horizon push?

Cards are color-coded by health — green (current), amber (stale), red (action required).


## 5. Drill-Down View

Click a project card and you see the full breakdown:

- Components grouped by Cost Category, with subtotals
- Vendor breakdown for the project
- Recent edits feed (from `Last Modified` timestamps)
- Completeness exceptions: missing prices, missing vendors, conflict statuses
- Internal Notes (visible here, hidden in on the Ground)


## 6. Cross-Project Vendor Analysis

The Vendors tab aggregates spend across every active job. Useful for negotiation, capacity planning, and spotting concentration risk.


# Part III — Reference


## 7. Metric Definitions

| Metric | Definition |
|---|---|
| Committed Budget | Sum of (Unit Price × Quantity) for components with both fields set |
| Missing Price | Components where Unit Price is empty |
| Missing Vendor | Components where Vendor is empty and Cost Type is not Labor |
| Stale Push | Last Horizon push more than 7 days ago |
| Overdue Selection | Selection whose Deadline is in the past and Status ≠ Confirmed |
| Sync Conflict | Components with Sync Status = Conflict |


## 8. Refresh Cadence

Compass pulls Sheet data every 5 minutes for active projects, every hour for archived. The "as of" timestamp at the top tells you the freshness. Hard-refresh with the ⟳ button if needed.


# Part IV — Care & Repair


## 9. Troubleshooting

### A project is not showing up

The project Sheet must be in the `active-projects` Drive folder with the standard naming convention, and shared with the Relay service account. Move/share it and it will appear on the next refresh.

### Numbers look wrong

Compass is only as accurate as the Sheet. If a project shows zero committed budget, the Sheet is probably missing prices. Drill into the project to confirm.

### "Vendor not found in BT"

This banner appears when Compass detects a Sheet vendor name that does not match any vendor in Buildertrend. Either fix the Sheet spelling, or add the vendor in BT before the next Relay sync.


## 10. Credits

Part of the PMM Tools suite by Trilogy Design Intelligence, a service of Trilogy Partners.

- **Design and requirements** — Trilogy Design Intelligence
- **Implementation** — Claude (Anthropic)
- **Questions or issues** — christianah@trilogybuilds.com

Follows the PMM Attribute Schema v1.0.

*Trilogy Partners. Boots on the Ground, Eyes on the Sky.*


---

**PMM Compass User Guide · v1.0**  
*Trilogy Partners. Boots on the Ground, Eyes on the Sky.*
