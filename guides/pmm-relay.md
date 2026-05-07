# PMM Relay

**Automated Drive → Buildertrend Sync**

*Created by Trilogy Partners using Trilogy Build Intelligence.*
*Boots on the Ground, Eyes on the Sky.*

**Version 0.1.1 · Schema v1.0 aligned**
**Audience:** Operations / IT person who runs the sync

---

## Contents

**Part One — Quick Start**
1. What PMM Relay Does
2. Installation
3. Your First Sync
4. Anatomy of a Sync Cycle

**Part Two — Core Workflows**
5. Configuration
6. CLI Commands
7. CSV Export Mode
8. API Mode (Future)

**Part Three — Reference**
9. Diff Engine Behavior
10. State Store
11. CSV Output Format
12. Configuration File Reference

**Part Four — Practical Notes**
13. Production Deployment
14. Monitoring & Logs
15. Troubleshooting
16. System Requirements & File Locations
17. Credits

---

# Part One — Quick Start

## 1. What PMM Relay Does

PMM Relay is a background service that automates the Google Sheet → Buildertrend half of the PMM Tools pipeline. It polls each project's Google Sheet on a schedule (default 5 minutes), detects changes, and pushes them to Buildertrend.

A typical Trilogy project flow:

1. PMM Connection ingests the architect's Revit IFC and tags SketchUp components.
2. PMM Horizon pushes tagged components to PMM in the Sky (the project Google Sheet).
3. Project Managers edit commercial data (Vendor, Unit Price, Cost Code, Allowance) in the Sheet.
4. PMM Relay (here) notices changes within 5 minutes and pushes them to Buildertrend.
5. PMM Compass and PMM on the Ground display the same Sheet data to admins and subs respectively.

PMM Relay is the only PMM Tools component that writes to Buildertrend automatically. It runs unattended.

> **TWO PUSH MODES** — Until you have BT partner API access, Relay generates CSV files that get manually imported into Buildertrend. Once you have API access, switch to API mode for true real-time sync. The diff engine and configuration are identical between modes — only the destination changes.

### Audience

This guide is for the operations/IT person who runs the sync. End users (designers, PMs, subs) never interact with Relay directly — they see its output in Buildertrend.

## 2. Installation

PMM Relay is a Python 3 command-line tool. It runs on macOS, Linux, and Windows. For production, run on an always-on server (Linux VPS, AWS/GCP small instance, or a Mac Mini).

### Prerequisites

- Python 3.10 or newer
- `pip` (comes with Python)
- A Google Cloud service account JSON key file (see Deployment Runbook Phase 1)
- The `client_email` from that key file shared on every project Sheet (Viewer permission is sufficient)

### Install steps

Extract the package:

```bash
tar -xzf pmm_relay_v0.1.1.tar.gz
cd pmm_relay
```

Install Python dependencies:

```bash
python3 -m pip install --user google-api-python-client google-auth
```

(Without these, Relay falls back to fixture mode for testing — no real Sheet access.)

Set the env var pointing to your service account key:

```bash
export PMM_SERVICE_ACCOUNT_JSON=/path/to/service-account.json
```

For persistent setup, add this line to your `~/.bashrc` or `~/.zshrc`.

Verify installation:

```bash
python3 -m sync_tool.cli check
```

Expected output:

```
┌─────────────────────────────────────────────────────────────┐
│ PMM Relay · Drive → Buildertrend sync                       │
│ Part of PMM Tools · Boots on the Ground, Eyes on the Sky    │
│ Trilogy Partners · Trilogy Build Intelligence               │
└─────────────────────────────────────────────────────────────┘
BT client: OK      Will write CSVs to ./bt_exports
Projects: 0 configured
State dir: ./state
```

### Updating

To install a newer version:

1. Stop any running Relay instance: `pkill -f "sync_tool.cli run"`
2. Replace the directory: extract the new `.tar.gz` over the old one (configs and `state/` are preserved)
3. Run `check` to confirm health
4. Restart with `run`

> **STATE PRESERVATION** — The `state/` directory and `sync_config.json` are preserved across updates. Per-project snapshots (the diff engine's "last seen" memory) are JSON files in `state/` — keeping them avoids triggering full re-syncs on every update.

## 3. Your First Sync

The fastest path to seeing PMM Relay work: configure one project, run one cycle, and confirm a CSV gets generated.

### What you need

- A Google Sheet with at least one PMM-tagged row (PMM Horizon will have populated this)
- The Sheet's ID (the long random string in the Sheet's URL)
- The Sheet shared with your service account email (Viewer access)

### Configure

Copy the example config:

```bash
cp fixtures/sync_config.example.json sync_config.json
```

Edit `sync_config.json`:

```json
{
  "state_dir": "./state",
  "bt_client": {
    "kind": "csv",
    "output_dir": "./bt_exports"
  },
  "projects": [
    {
      "sheet_id": "1AbCDeFgHIjkLMnoPqRsTuVWxyZ",
      "project_name": "25 Hickory Lane"
    }
  ]
}
```

Verify config:

```bash
python3 -m sync_tool.cli check
```

### Run one cycle

```bash
python3 -m sync_tool.cli once
```

Expected output:

```
[25 Hickory Lane] diff: 47 created | push: 47 changes
   → ./bt_exports/25_hickory_lane__20260427_103000.csv
```

The first run creates a baseline — every component in the Sheet is reported as `CREATED` and written to a CSV. Subsequent runs only report actual changes.

### Inspect the output

```bash
ls -la bt_exports/
head -5 bt_exports/25_hickory_lane__*.csv
```

You'll see a CSV with columns matching what BT's Estimate Import accepts: `Title`, `Cost Category`, `Cost Code`, `Cost Type`, `Description`, `Quantity`, `Unit`, `Unit Price`, `Amount`, `Vendor/Sub`, `Internal Notes`, plus two PMM-internal columns (`PMM UUID`, `Change Kind`).

### Run again — second cycle

```bash
python3 -m sync_tool.cli once
```

This time, the output is:

```
[25 Hickory Lane] diff: no changes
```

No CSV is generated — Relay correctly detected nothing changed since the previous cycle.

> **STATE-BASED DIFFING** — Relay remembers what each Sheet looked like on the last cycle (in `state/`). The next cycle compares the current Sheet to that snapshot and only acts on actual differences. This is why second runs against unchanged Sheets do nothing.

## 4. Anatomy of a Sync Cycle

Each polling cycle is a series of well-defined steps per project:

### Per-project flow

For each configured project:

1. **Load last snapshot.** Read `state/{sheet_id}.json` if it exists. This is what we last saw.
2. **Fetch current Sheet.** Use Google Sheets API (or fixture in test mode) to read every row in `_Index` and the data tabs. Apply Schema v1.0 normalization at the read boundary so business logic only sees Title Case keys.
3. **Compute the diff.** Compare last snapshot to current state, row-by-row by `PMM ID`. Emit one of five outcomes per row:
   - `CREATED` — UUID is new
   - `UPDATED` — fields changed since last snapshot
   - `DELETED` — was active, now `status: deleted`
   - `UNDELETED` — previously deleted, now active
   - `UNCHANGED` — no-op
4. **Filter for BT-relevance.** Not every Sheet change matters to BT. Internal fields like `Group` are detected as `UPDATED` but flagged not BT-relevant. Only commercial fields trigger BT pushes.
5. **Push BT-relevant changes** via the configured client (CSV or API).
6. **Save new snapshot** if push succeeded. Transient failures keep the old snapshot, so the next cycle retries.

### What gets pushed where

| Change type | What goes to BT |
| --- | --- |
| CREATED | Full row, marked CREATED |
| UPDATED (BT-relevant fields) | Full row, marked UPDATED |
| UPDATED (only non-BT fields) | Nothing — but snapshot still saved |
| DELETED | Full row, marked DELETED |
| UNDELETED | Full row, marked CREATED (BT sees a fresh row) |
| UNCHANGED | Nothing |

### Fault tolerance

- **Network blip mid-cycle.** Relay logs the error, leaves the snapshot unchanged, retries on the next cycle.
- **Sheet not shared with service account.** Relay logs "Sheet unreachable," skips that project, continues with others.
- **Crash mid-push.** No snapshot save until push succeeds, so the next start re-tries the same diff.
- **Corrupt state file.** Treated as a fresh start (everything re-pushed once). Annoying but not wrong.

> **LAST-WRITE-WINS** — If the same Sheet is edited rapidly, Relay sees a single snapshot per cycle — intermediate states between cycles are not preserved. For BT, the most recent state at poll time is what gets sent.

---

# Part Two — Core Workflows

## 5. Configuration

PMM Relay's behavior is fully driven by `sync_config.json` and a few environment variables.

### Config file location

Default: `./sync_config.json` in the directory you run Relay from.

Override: `--config /path/to/config.json` on any CLI command, or env var `PMM_SYNC_CONFIG=/path/to/config.json`.

### Config schema

```json
{
  "state_dir": "./state",
  "bt_client": {
    "kind": "csv",
    "output_dir": "./bt_exports"
  },
  "projects": [
    {
      "sheet_id": "1AbCDeFgHIjkLMnoPqRsTuVWxyZ",
      "project_name": "25 Hickory Lane",
      "bt_job_id": ""
    },
    {
      "sheet_id": "1XyzABCdef987654321",
      "project_name": "42 Oak Creek"
    }
  ]
}
```

### Field reference

| Field | Required | Purpose |
| --- | --- | --- |
| `state_dir` | yes | Where per-project state JSON files live |
| `bt_client.kind` | yes | `csv` or `api` |
| `bt_client.output_dir` | csv mode | Where to write generated CSV files |
| `bt_client.client_id` | api mode | BT partner API client ID |
| `bt_client.client_secret` | api mode | BT partner API client secret |
| `bt_client.api_base` | optional | BT API base URL (default `https://api.buildertrend.com`) |
| `projects[]` | yes | List of projects to sync |
| `projects[].sheet_id` | yes | Google Sheet ID |
| `projects[].project_name` | recommended | Used in log lines and CSV file names |
| `projects[].bt_job_id` | api mode | BT's internal Job ID for this project |

### Environment variables

| Variable | Purpose |
| --- | --- |
| `PMM_SERVICE_ACCOUNT_JSON` | Path to Google Cloud service account JSON key |
| `PMM_SYNC_CONFIG` | Override default config path |
| `BT_CLIENT_ID` | Override `bt_client.client_id` (api mode) |
| `BT_CLIENT_SECRET` | Override `bt_client.client_secret` (api mode) |

> **CREDENTIAL HYGIENE** — Store sensitive values (service account JSON path, BT client secret) in env vars or your host's secrets manager — never commit them to git. The example config file contains no secrets.

### Adding a project

To add a new project to an already-running Relay:

1. Stop Relay: `pkill -f "sync_tool.cli run"`
2. Edit `sync_config.json`, append to the `projects` array
3. Confirm: `python3 -m sync_tool.cli check`
4. Restart: `nohup python3 -m sync_tool.cli run > pmm_relay.log 2>&1 &`

The new project starts at the next cycle. First cycle will see every row as `CREATED`, generating one large CSV. Subsequent cycles only emit real diffs.

## 6. CLI Commands

PMM Relay has four commands. Run any of them from the directory containing `sync_config.json` (or pass `--config`).

### `check`

```bash
python3 -m sync_tool.cli check
```

Verifies configuration without doing any sync work. Reports BT client connection health (filesystem write test for CSV mode; auth ping for API mode), number of configured projects, and state directory location.

Use this after installing, after editing config, or before running `run` to deploy a configuration change.

### `projects`

```bash
python3 -m sync_tool.cli projects
```

Lists configured projects with their Sheet IDs.

### `once`

```bash
python3 -m sync_tool.cli once
```

Runs exactly one polling cycle across all projects, then exits. Use this for testing, for cron-driven deployments (each cron tick runs one cycle), or for one-off "I just edited a Sheet, push it now" workflows.

### `run`

```bash
python3 -m sync_tool.cli run
python3 -m sync_tool.cli run --interval 600   # 10-min cycles
python3 -m sync_tool.cli run --interval 60    # 1-min cycles
```

Runs cycles continuously, sleeping `--interval` seconds between them (default 300). Use this for dedicated-server deployments, when cron isn't available, or when you want minimal latency between polls.

`run` blocks the terminal. To run in the background:

```bash
nohup python3 -m sync_tool.cli run > pmm_relay.log 2>&1 &
```

To stop:

```bash
pkill -f "sync_tool.cli run"
```

> **CRON VS RUN** — For most deployments, cron + `once` is simpler and more robust than `run`. A cron job that fires every 5 minutes naturally restarts on crashes, doesn't accumulate memory leaks, and integrates with normal sysadmin tooling. Use `run` only when cron isn't available.

## 7. CSV Export Mode

The default mode. Works today, no BT partner API access required.

### How it works

When Relay detects BT-relevant changes:

1. Generate a CSV file named `{project_slug}__{YYYYMMDD_HHMMSS}.csv` in `bt_client.output_dir`
2. Columns match BT's Estimate Import wizard exactly
3. UTF-8 with BOM (so Excel and Numbers open it cleanly)
4. The file is your responsibility from there — import it into BT manually

### Importing the CSV into BT

For each generated CSV:

1. In Buildertrend, navigate to the project
2. Estimate → Import (or wherever your BT instance has CSV import)
3. Upload the CSV
4. BT auto-maps columns (since column names match its expected format)
5. Review and confirm import

### Working with Change Kind

The CSV's `Change Kind` column tells you what kind of import it is:

- `CREATED` — these are new line items; BT's import will add them
- `UPDATED` — these need to overwrite existing line items; BT may need configuration to do this
- `DELETED` — these need to be removed from BT; usually requires manual deletion in BT after import

For the cleanest workflow: filter the CSV before importing. Only import `CREATED` rows on the first import; track `UPDATED` and `DELETED` separately and apply them via BT's UI directly.

### File naming convention

Files use a timestamp slug so history is preserved:

```
25_hickory_lane__20260427_103000.csv      # 2026-04-27 10:30:00 UTC
25_hickory_lane__20260427_103515.csv      # 5 min 15 sec later
```

Sort alphabetically and you have your sync history.

### Cleanup

Old CSV files accumulate. They're not auto-purged. Recommended cleanup:

```bash
# Keep last 30 days
find bt_exports -name "*.csv" -mtime +30 -delete
```

Add this as a weekly cron job.

## 8. API Mode (Future)

When Trilogy receives Buildertrend partner API access, Relay switches modes via a one-line config change.

### Switching to API mode

Edit `sync_config.json`:

```json
{
  "bt_client": {
    "kind": "api",
    "client_id": "your_partner_client_id",
    "client_secret": "your_partner_client_secret"
  }
}
```

Add `bt_job_id` to each project entry (BT's internal Job ID for that project). Restart Relay.

### What changes vs CSV mode

- Diff engine: same
- State store: same
- Polling cycle: same
- Output: instead of writing a CSV file, Relay calls BT's API endpoints (`POST /lineItems`, `PUT /lineItems/{id}`, `DELETE /lineItems/{id}`)
- Manual import step: eliminated

### Implementation status

`sync_tool/clients/api.py` contains a stub with four scaffolded methods:

- `_ensure_token()` — OAuth token exchange
- `_create_line_item(job_id, row_values)` — POST new line items
- `_update_line_item(job_id, bt_line_id, row_values)` — PUT updates
- `_delete_line_item(job_id, bt_line_id)` — DELETE removed items

Plus `_resolve_bt_line_id(sheet_id, pmm_uuid)` for mapping PMM UUIDs to BT's internal line IDs.

These need filling in once BT delivers their partner API credentials and documentation. The rest of Relay (cli, poller, differ, state store) requires zero changes when switching modes.

---

# Part Three — Reference

## 9. Diff Engine Behavior

The diff engine is pure: takes two `SheetSnapshot` objects (last + current), returns a `SyncPlan`.

### Change categories

| Kind | Trigger |
| --- | --- |
| CREATED | UUID present in current, absent in last |
| UPDATED | UUID in both, with at least one differing field value |
| DELETED | UUID in last (active), in current (`status: deleted`) |
| UNDELETED | UUID in last (`status: deleted`), in current (active) |
| UNCHANGED | UUID in both, all values identical (whitespace-trimmed) |

### Field-level filtering

For UPDATED changes, the diff engine identifies which fields changed. Only changes to BT-relevant fields trigger a BT push:

- Title
- Description
- Cost Category
- Cost Code
- Cost Type
- Unit
- Unit Price
- Amount
- Allowance
- Vendor
- Quantity
- Notes
- Scope of Work
- PO Date
- PO Notes

A change to `Group` (an internal grouping label) is detected as UPDATED but doesn't trigger a BT push. The plan still records the change — `is_bt_relevant()` returns False — and the snapshot still updates so the next cycle doesn't re-detect.

### Whitespace handling

Values are stripped of leading/trailing whitespace before comparison. Editing "Cabinet" to " Cabinet " is not an update. This avoids false positives from accidental whitespace introduced by copy-paste.

### Soft deletes

Deletes are soft. The Sheet's `_Index` tab marks rows `status: deleted` rather than actually removing them. This:

- Keeps row numbers stable (so `_Index` references stay valid)
- Preserves audit trail
- Allows "undelete" to restore a row to active

The diff engine handles soft delete and undelete correctly: deleting → `DELETED`, restoring → `UNDELETED`.

## 10. State Store

State lives as one JSON file per project in the `state_dir` directory.

### File structure

```
state/
├── 1AbCDeFgHIjkLMnoPqRsTuVWxyZ.json
├── 1XyzABCdef987654321.json
└── ...
```

Each file is a complete snapshot of what the Sheet looked like on the last successful cycle:

```json
{
  "sheet_id": "1AbCDeFgHIjkLMnoPqRsTuVWxyZ",
  "project_name": "25 Hickory Lane",
  "taken_at": "2026-04-27T10:30:00",
  "rows": [
    {
      "uuid": "abc-123-uuid",
      "tab_name": "06 - Carpentry",
      "row_number": 4,
      "status": "active",
      "values": {
        "PMM ID": "abc-123-uuid",
        "Component Name": "UpperCabinet_36",
        "Title": "Upper Cabinet 36\"",
        "Cost Category": "06 - Carpentry",
        "Unit Price": "850.00",
        "Vendor": "Heritage Cabinet Co"
      }
    }
  ]
}
```

### Why JSON, not a database

Trade-offs for early-stage operations:

- **Pros:** Easy to inspect (`cat state/*.json | jq`), easy to back up, easy to manually edit during debugging, no separate DB to deploy
- **Cons:** Doesn't scale past hundreds of projects efficiently

For a few dozen projects (which describes Trilogy's foreseeable scale), JSON is fine. Migration to SQLite is a 50-line change if needed later.

### State recovery

If a state file is corrupted (malformed JSON), Relay treats it as a fresh start: every row in the Sheet is reported `CREATED` on the next cycle. Annoying (one large CSV gets generated unnecessarily) but not wrong — BT just receives the full set of rows again.

To force a fresh start manually: `rm state/{sheet_id}.json`. The next cycle will baseline.

> **DON'T DELETE STATE WHEN UPGRADING** — When upgrading Relay, preserve the `state/` directory. Otherwise every project re-baselines on the first cycle, generating one large CSV per project unnecessarily.

## 11. CSV Output Format

Generated CSVs match BT's Estimate Import expected format exactly, plus two PMM-internal columns at the end.

### Columns

| Column | Source | Purpose |
| --- | --- | --- |
| Title | Sheet Title | BT line item title |
| Cost Category | Sheet Cost Category | BT division/CSI |
| Cost Code | Sheet Cost Code | BT cost code |
| Cost Type | Sheet Cost Type | Material/Labor/Subcontract/etc. |
| Description | Sheet Description | Long-form description |
| Quantity | Sheet Quantity | Numeric |
| Unit | Sheet Unit | EA, LF, SF, etc. |
| Unit Price | Sheet Unit Price | Decimal, dollar-formatted (no `$`) |
| Amount | Sheet Amount | Decimal |
| Vendor/Sub | Sheet Vendor | Supplier/sub name |
| Internal Notes | Sheet Notes | Internal notes |
| PMM UUID | Sheet PMM ID | Internal — BT ignores |
| Change Kind | Diff engine | `CREATED`, `UPDATED`, `DELETED`, etc. |

### Encoding

UTF-8 with BOM. Opens correctly in Excel, Numbers, Google Sheets, and BT's import wizard.

### Filename pattern

```
{project_slug}__{YYYYMMDD_HHMMSS}.csv
```

`project_slug` is `project_name` lowercased, with non-alphanumeric chars replaced by underscores, truncated to 60 chars.

## 12. Configuration File Reference

### `sync_config.json` (full schema)

```json
{
  "state_dir": "./state",
  "bt_client": {
    "kind": "csv | api",
    "output_dir": "./bt_exports",
    "client_id": "(api mode only)",
    "client_secret": "(api mode only)",
    "api_base": "https://api.buildertrend.com"
  },
  "projects": [
    {
      "sheet_id": "REQUIRED",
      "project_name": "RECOMMENDED",
      "bt_job_id": "(api mode only)"
    }
  ]
}
```

### Per-tool environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PMM_SERVICE_ACCOUNT_JSON` | (none) | Path to GCP service account JSON. Required for real Sheet access. |
| `PMM_SYNC_CONFIG` | `./sync_config.json` | Override config path |
| `BT_CLIENT_ID` | (none) | Override `bt_client.client_id` |
| `BT_CLIENT_SECRET` | (none) | Override `bt_client.client_secret` |

---

# Part Four — Practical Notes

## 13. Production Deployment

For production, run Relay on an always-on server.

### Option A: systemd (Linux, recommended)

Create `/etc/systemd/system/pmm-relay.service`:

```ini
[Unit]
Description=PMM Relay - Drive to Buildertrend sync
After=network.target

[Service]
Type=simple
User=pmm
WorkingDirectory=/opt/pmm_relay
Environment="PMM_SERVICE_ACCOUNT_JSON=/etc/pmm/service-account.json"
ExecStart=/usr/bin/python3 -m sync_tool.cli run
Restart=on-failure
RestartSec=30
StandardOutput=append:/var/log/pmm_relay.log
StandardError=append:/var/log/pmm_relay.log

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl enable pmm-relay
sudo systemctl start pmm-relay
sudo systemctl status pmm-relay
```

### Option B: cron with `once`

Edit your crontab (`crontab -e`):

```cron
*/5 * * * * cd /opt/pmm_relay && /usr/bin/python3 -m sync_tool.cli once >> /var/log/pmm_relay.log 2>&1
```

This runs once every 5 minutes. Simpler than systemd; auto-restarts naturally on the next cron tick.

### Option C: Docker

Build a small Docker image:

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir google-api-python-client google-auth
CMD ["python", "-m", "sync_tool.cli", "run"]
```

Run with mounted config and credentials:

```bash
docker run -d \
  -v $(pwd)/sync_config.json:/app/sync_config.json \
  -v $(pwd)/state:/app/state \
  -v $(pwd)/bt_exports:/app/bt_exports \
  -v $(pwd)/service-account.json:/app/service-account.json \
  -e PMM_SERVICE_ACCOUNT_JSON=/app/service-account.json \
  --restart unless-stopped \
  pmm-relay
```

### Option D: Fly.io / Railway / Render

These serverless-ish hosts work with `run` mode (continuous process). Configure as a "background worker" or "always-on service" with the same env vars and config file.

## 14. Monitoring & Logs

### Log format

Each cycle produces one log line per project:

```
2026-04-27 10:30:00 INFO  pmm_relay: [25 Hickory Lane] diff: 1 created, 2 updated
                                          | push: 4 changes → ./bt_exports/25_hickory_lane__...csv
2026-04-27 10:35:00 INFO  pmm_relay: [25 Hickory Lane] no changes
2026-04-27 10:40:00 ERROR pmm_relay: [42 Oak Creek] ERROR: Sheet unreachable or not found
```

### Tailing the log

```bash
tail -f /var/log/pmm_relay.log
```

### What to monitor

- **Cycles completing** — at least one log line per `interval` seconds. If silent for 2× interval, something's wrong.
- **Per-project errors** — `ERROR:` lines indicate Sheet access issues, almost always a sharing problem.
- **CSV file count** — if you expect activity but no CSVs are being generated, either nothing changed or there's a write permission issue.
- **Disk space** — `bt_exports/` accumulates files. Set up cleanup (Section 7).

### Alerting

For production-grade ops, pipe logs to a centralized logger (Datadog, Loggly, CloudWatch) and set alerts:

- "No log line in 10 minutes" → Relay process died
- "ERROR more than 5 times in 1 hour" → Sheet access problem with one or more projects

## 15. Troubleshooting

### "BT client: FAIL — Cannot write to ./bt_exports"

The `output_dir` doesn't exist or isn't writable. Create it:

```bash
mkdir -p bt_exports
chmod 755 bt_exports
```

### "[Project Name] ERROR: Sheet unreachable"

Most common cause: the Sheet isn't shared with your service account.

1. Open the Sheet in your browser
2. Click Share
3. Add the `client_email` from your service account JSON
4. Permission: **Viewer**
5. Uncheck "Notify people"
6. Click Share
7. Wait 30 seconds, retry: `python3 -m sync_tool.cli once`

### "[Project Name] ERROR: 403 Forbidden"

Could be:

- Service account email not granted access (see above)
- Service account JSON expired or revoked — check Google Cloud Console → IAM → Service Accounts → Keys

### "Why is every cycle reporting CREATED for everything?"

Either:

1. State directory doesn't exist or isn't writable. Check `state/` exists and is writable: `ls -la state/`
2. State files are being deleted between runs (e.g. `rm -rf state/*` in a startup script)
3. You're running with a different `state_dir` than last time

The state directory is the diff engine's memory. Without it, every cycle is a fresh baseline.

### "CSV files have legacy snake_case column names"

Run **Migrate Linked Sheet to Schema v1.0** from PMM Horizon. After migration, future Relay cycles will produce v1.0 Title Case headers.

### "Two Relay instances are both running"

```bash
ps aux | grep sync_tool.cli
```

If you see two `run` processes, one is stale. Stop both and start fresh:

```bash
pkill -f "sync_tool.cli run"
nohup python3 -m sync_tool.cli run > pmm_relay.log 2>&1 &
```

### "Quota exceeded" errors

Google Sheets API enforces 300 reads/min per project. If you have many projects on a 5-minute interval, that's fine. If you have 50+ projects on a 1-minute interval, you may hit the quota.

Solutions (in order of simplicity):

1. Increase the polling interval: `--interval 600`
2. Run multiple Relay instances, each handling a subset of projects (separate config files)
3. Request a higher quota from Google Cloud Console

### Diagnostic commands

```bash
# What does the current snapshot look like for a project?
cat state/{sheet_id}.json | jq '.rows | length'

# What's the most recent CSV?
ls -lt bt_exports/ | head -5

# What's Relay actually doing?
tail -f pmm_relay.log

# Is Relay running?
ps aux | grep sync_tool.cli

# Test config without doing any sync work
python3 -m sync_tool.cli check

# Run one cycle manually for debugging
python3 -m sync_tool.cli once
```

## 16. System Requirements & File Locations

### Requirements

- Python 3.10 or newer
- macOS, Linux, or Windows
- Internet access to `https://sheets.googleapis.com` and `https://oauth2.googleapis.com`
- Disk: minimal — state files are small (KB per project), CSVs accumulate (~10 KB per CSV)
- Memory: minimal — under 100 MB for typical workloads

### File locations

When installed:

```
pmm_relay/
├── sync_tool/
│   ├── cli.py                  ← entry point
│   ├── clients/
│   │   ├── base.py             ← BuildertrendClient interface
│   │   ├── csv_export.py       ← CSV mode
│   │   └── api.py              ← API mode (stub)
│   └── core/
│       ├── fields.py           ← Schema v1.0 fields
│       ├── models.py           ← SheetSnapshot, RowDiff, SyncPlan
│       ├── differ.py           ← pure diff function
│       ├── sheets_reader.py    ← Google Sheets + stub readers
│       ├── state_store.py      ← JSON state files
│       └── poller.py           ← cycle orchestrator
├── tests/
│   └── test_sync_tool.py       ← 22 tests
├── fixtures/
│   ├── sync-fixture-v1.json
│   ├── sync-fixture-v2.json
│   └── sync_config.example.json
├── requirements.txt
└── README.md
```

User-created (in working directory):

```
sync_config.json         ← your config
state/                   ← per-project snapshots
bt_exports/              ← generated CSVs
pmm_relay.log            ← log file (if you redirected stdout)
```

## 17. Credits

PMM Relay is part of the **PMM Tools** suite by **Trilogy Design Intelligence**, a service of **Trilogy Partners**.

- **Design and requirements** — Trilogy Design Intelligence
- **Implementation** — Claude (Anthropic)
- **Questions or issues** — christianah@trilogybuilds.com

This guide and the tool both follow the **PMM Attribute Schema v1.0** — the canonical contract shared across PMM Connection, PMM Horizon, PMM in the Sky, PMM on the Ground, PMM Compass, PMM Bridge, and PMM Relay.

For schema details, see the PMM Attribute Schema v1.0 specification.

PMM Relay User Guide — version matched to tool **v0.1.1**.

---

*Trilogy Design Intelligence · PMM Relay User Guide · v0.1.1*
*Trilogy Partners. Boots on the Ground, Eyes on the Sky.*
