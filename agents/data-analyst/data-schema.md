# Data Analyst — Data Schema

All records share these base fields:

```ts
interface BaseRecord {
  id: string;          // UUID v4
  createdAt: string;   // ISO-8601 UTC
  updatedAt: string;   // ISO-8601 UTC
}
```

All writes are atomic: write to a sibling `*.tmp` file, then rename
onto the target path. Never edit in-place. Never write anywhere
under `.houston/<agent>/` — the file watcher skips those paths.
Exception: the seeded `.houston/activity.json` onboarding card at
install time.

---

## Config — what the agent learns about the user

Nothing in `config/` is shipped in the repo. Every file appears at
runtime, written by `onboard-me` or progressive capture.

### `config/profile.json`

```ts
interface Profile {
  userName: string;
  onboardedAt: string;
  status: "onboarded" | "partial";
}
```

### `config/data-sources.json`

```ts
interface DataSource {
  id: string;
  name: string;                 // display name
  kind: "warehouse" | "product-db" | "billing" | "metric-layer" | "bi-tool";
  dialect: "snowflake" | "bigquery" | "redshift" | "databricks" | "postgres" | "other";
  connectionCategory: string;   // Composio category to re-discover tool slugs at runtime
  costCeilingScannedGb?: number;       // default 10 — overridable here
  costCeilingSeconds?: number;          // default 30 — overridable here
  notes?: string;
  capturedAt: string;
}
```

Thresholds live here. Skills never hardcode numbers — they read
these ceilings before running cost checks.

### `config/schemas.json`

```ts
interface SchemaEntry {
  sourceId: string;
  tableFullName: string;        // e.g. "analytics.events"
  columns: { name: string; type: string; nullable: boolean }[];
  primaryKey?: string[];
  foreignKeys?: { from: string; to: string }[];
  expectedStalenessHours?: number;    // overridable per-table
  lastIntrospectedAt: string;
}
```

Populated lazily by `run-sql-query` / `track-metric` when a query
needs a table not yet seen (or an entry is older than 7 days).

### `config/metrics.json`

```ts
interface Metric {
  id: string;
  slug: string;
  name: string;
  definition: string;          // 1-line description
  sqlSnippet: string;          // parameterized on {{date}}
  sourceId: string;
  cadence: "daily" | "weekly";
  unit: "count" | "currency" | "percent" | "ratio" | "duration" | "other";
  direction: "higher-is-better" | "lower-is-better" | "target-is-best";
  thresholds?: { red?: number; yellow?: number; sigma?: number };
  createdAt: string;
  updatedAt: string;
}
```

### `config/business-context.md`

Markdown — what this business does, how metrics map to the
customer journey, which metrics drive which. Captured progressively.

### `config/experiments-framework.md`

Markdown — default significance threshold, MDE, guardrails, and any
house rules. Captured on first experiment analysis.

### `config/dashboards.json`

```ts
interface Dashboard {
  id: string;
  name: string;
  audience: string;
  cadence: string;
  sections: {
    title: string;
    visualizations: {
      metricId?: string;
      title: string;
      chart: "line" | "bar" | "number" | "sparkline" | "funnel" | "table";
      sqlSnippet: string;        // parameterized; read-only
      notes?: string;
    }[];
  }[];
  createdAt: string;
  updatedAt: string;
}
```

### `config/voice.md`

Markdown — optional. When I summarize findings for an investor
update or customer-facing readout (handoff to Chief of Staff), I
read voice notes. Usually present thanks to Head of Operations'
onboarding.

---

## Domain data — what the agent produces

### `outputs.json` — dashboard index

```ts
interface Output extends BaseRecord {
  type: "query-answer"     // run-sql-query
       | "metric-tracked"  // track-metric
       | "experiment"      // analyze-experiment
       | "dashboard-spec"  // spec-dashboard
       | "data-quality"    // run-data-qa
       | "metrics-rollup"; // weekly-metrics-rollup
  title: string;
  summary: string;
  path: string;
  status: "draft" | "ready";
}
```

### `queries.json` — query library index

Live file. One entry per saved query. Read-merge-write atomically.

```ts
interface QueryRecord extends BaseRecord {
  slug: string;
  purpose: string;
  author: "agent" | "user";       // promoted from ad-hoc = "user"
  sourceId: string;
  schemaDeps: string[];           // e.g. ["analytics.events"]
  tags: string[];
  costWarning?: {
    estimatedScannedGb?: number;
    estimatedSeconds?: number;
  };
  lastRunAt?: string;
  lastRowCount?: number;
}
```

Backed by files under `queries/{slug}/`:
- `query.sql` — the query body (parameterized with `{{date}}` etc).
- `result-latest.csv` — the most recent result (up to 10k rows).
- `notes.md` — purpose, parameters, schema deps, caveats, last-run
  metadata.

### `metrics-daily.json` — live snapshots index

```ts
interface MetricSnapshot extends BaseRecord {
  metricId: string;
  date: string;                 // YYYY-MM-DD
  value: number;
  changeVsPrev?: number | null;
  changeVs7dAvg?: number | null;
  changeVs28dAvg?: number | null;
}
```

### `anomalies.json` — live anomaly index

```ts
interface Anomaly extends BaseRecord {
  metricId: string;
  detectedAt: string;
  date: string;
  baseline: number;             // mean7
  observed: number;
  deviationSigma: number;       // sigma7
  direction: "up" | "down";
  severity: "P1" | "P2" | "P3";
  possibleCauses: string[];     // ranked, 1-3
  status: "open" | "acknowledged" | "resolved";
}
```

### `experiments.json` — experiment index

```ts
interface Experiment extends BaseRecord {
  slug: string;
  hypothesis: string;
  variants: string[];
  primaryMetric: string;
  guardrailMetrics: string[];
  startDate: string;
  endDate?: string;
  sampleSize?: Record<string, number>;  // { control: N, variant-a: N }
  status: "draft" | "running" | "ended" | "analyzed";
}
```

Backed by `experiments/{slug}/readout.md` on analysis.

### Topic subfolders

| Subfolder | Written by | Content |
|-----------|------------|---------|
| `queries/{slug}/` | `run-sql-query` | `query.sql`, `result-latest.csv`, `notes.md`. |
| `experiments/{slug}/` | `analyze-experiment` | `readout.md` with design, results, recommendation. |
| `data-quality-reports/{YYYY-MM-DD}/` | `run-data-qa` | `report.md` grouped by table. |
| `rollups/` | `weekly-metrics-rollup` | `{YYYY-MM-DD}.md` — weekly pulse. |

---

## Cross-agent reads

Before every substantive (non-onboard-me) skill, this agent reads
(never writes):

- `../head-of-operations/company-operating-context.md` — active
  priorities (which metrics matter), tools + data systems (where
  data lives), voice. If missing or empty, the skill stops and
  tells the user to run Head of Operations'
  `define-operating-context` first.

The Head of Operations' `run-weekly-review` reads
`outputs.json` from this agent (plus `metrics-daily.json` and the
latest `rollups/` file).

---

## Write discipline

- **Atomic writes.** `{file}.tmp` → rename.
- **IDs** UUID v4.
- **Timestamps** ISO-8601 UTC.
- **Never write under `.houston/<agent>/` at runtime.** The watcher
  skips that path.
- **Live indices** (`queries.json`, `metrics-daily.json`,
  `anomalies.json`, `experiments.json`) are indices — rows updated
  in place; they are also surfaced via `outputs.json` entries when
  a substantive artifact (query, experiment, DQ report) lands.

---

## Hard-rule enforcement — read-only SQL

Every skill that composes SQL scans the query text for forbidden
keywords (case-insensitive): `INSERT`, `UPDATE`, `DELETE`, `MERGE`,
`DROP`, `CREATE`, `ALTER`, `TRUNCATE`, `GRANT`, `REVOKE`. If any
appear, the skill refuses, tells the user the rule, and stops. No
workarounds.

## Cost ceiling — from config, not hardcoded

Before executing a query, skills run the warehouse's explain / dry-
run tool. If the estimate exceeds the ceiling in
`config/data-sources.json` (default 10 GB scanned or 30 seconds),
the skill states the estimate and waits for explicit approval.
These defaults live in `config/data-sources.json` and are
user-overridable.
