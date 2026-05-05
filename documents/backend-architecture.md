# Backend Architecture

This document describes the design of the Express backend that powers the
Industrial Employee Burnout Detection System. It is written so that it can be
copied into the thesis report with minimal editing: every section explains
what was built and *why*.

## 1. Goals and constraints

The backend has to satisfy three competing demands:

| Demand                              | Implication                                  |
|-------------------------------------|----------------------------------------------|
| Two heterogeneous data models       | Use both **MySQL** and **MongoDB**.          |
| Optional ML inference (Python)      | Treat the AI service as a **swappable** dependency. |
| Distinct employee vs. admin views   | Enforce **role-based access control** at the API edge. |

Real factory HR records are private, so the backend simulates HR fields when
an employee registers. The simulator draws values from the same ranges as the
training dataset (`mock-data/employee-burnt-out.json`) so the ML model later
sees in-distribution inputs.

## 2. Technology stack

| Concern               | Choice                            | Rationale                                          |
|-----------------------|-----------------------------------|----------------------------------------------------|
| HTTP framework        | Express 5 (ESM)                   | Minimal, well-known, async error handling built in |
| Relational DB         | MySQL 8 via `mysql2/promise`      | Matches the schema specified in the thesis        |
| Document DB           | MongoDB via Mongoose 8            | Flexible documents for the quiz + raw answers     |
| Validation            | Zod                               | Type-safe schemas, single source of truth         |
| Auth                  | JWT (`jsonwebtoken`) + `bcryptjs` | Stateless, suits a SPA frontend                   |
| Logging               | Pino + pino-http                  | Low overhead, structured JSON logs                |
| Hardening             | Helmet, CORS, Compression         | Standard production middleware                    |
| Config                | dotenv + Zod-validated `env.js`   | Fail-fast on missing/invalid env vars             |

## 3. Layered structure

```
HTTP request
   │
   ▼
┌──────────────────────────── routes/ ────────────────────────────┐
│  thin Express routers, attach middleware (auth + validation)    │
└──────────────────────────────┬──────────────────────────────────┘
                               ▼
┌──────────────────────── controllers/ ───────────────────────────┐
│  parse params, call services, format response envelope          │
└──────────────────────────────┬──────────────────────────────────┘
                               ▼
┌──────────────────────── services/ ──────────────────────────────┐
│  business rules (scoring, risk mapping, alert rules,            │
│  AI dispatch, transactions)                                     │
└────────┬─────────────────────────────────────────┬──────────────┘
         ▼                                         ▼
┌─── models/mysql/ ───┐                ┌─── models/mongo/ ───┐
│  thin repository    │                │  Mongoose schemas    │
│  functions over     │                │  + collection logic  │
│  parameterised SQL  │                │                      │
└─────────┬───────────┘                └──────────┬───────────┘
          ▼                                       ▼
   ┌─────────────┐                          ┌────────────┐
   │   MySQL     │                          │  MongoDB   │
   └─────────────┘                          └────────────┘
```

The strict layering keeps responsibilities pure:

- **Routes** know about HTTP and middleware only.
- **Controllers** are HTTP-facing glue (1–5 lines each).
- **Services** contain all domain logic and are transport-agnostic.
- **Repositories** own SQL strings or Mongoose calls; the rest of the code
  never touches the drivers directly.

## 4. Folder layout

```
back-end/
├── db/
│   └── schema.sql              # MySQL DDL + reference rows (run manually)
├── scripts/
│   └── seed.mjs                # Seed CBI quiz, admin user, default resources
├── src/
│   ├── app.js                  # Build the Express app (no I/O)
│   ├── server.js               # Bootstrap: connect DBs, start listening
│   ├── config/
│   │   ├── env.js              # Zod-validated process.env
│   │   ├── db-mysql.js         # Pool, withTransaction(), pingMysql()
│   │   ├── db-mongo.js         # mongoose.connect()
│   │   └── logger.js           # Pino logger (pretty in dev, JSON in prod)
│   ├── middleware/
│   │   ├── auth.js             # authenticate(), requireRole(), signToken()
│   │   ├── validate.js         # Zod-based request validator
│   │   ├── async-handler.js    # Promise → next(err) wrapper
│   │   ├── error-handler.js    # Central error → JSON envelope
│   │   └── not-found.js
│   ├── models/
│   │   ├── mysql/              # one repo file per table
│   │   │   ├── user.repo.js
│   │   │   ├── department.repo.js
│   │   │   ├── hr-profile.repo.js
│   │   │   ├── assessment-result.repo.js
│   │   │   ├── alert.repo.js
│   │   │   ├── help-resource.repo.js
│   │   │   └── employee-kpi.repo.js
│   │   └── mongo/
│   │       ├── cbi-quiz.model.js
│   │       └── quiz-submission.model.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── quiz.service.js
│   │   ├── dashboard.service.js
│   │   ├── alert.service.js
│   │   ├── resource.service.js
│   │   └── ai.service.js
│   ├── controllers/            # thin HTTP layer per domain
│   ├── validators/             # Zod schemas per domain
│   ├── routes/                 # Express routers + index aggregator
│   └── utils/
│       ├── api-error.js        # ApiError class with HTTP + code
│       ├── api-response.js     # ok() / created() helpers
│       ├── risk-level.js       # burnRate → risk thresholds
│       ├── score-calculator.js # CBI scoring (incl. reverse scoring)
│       ├── hr-simulator.js     # synthetic HR profile generator
│       ├── anonymous-id.js     # "Worker #0042" formatter
│       └── pagination.js
├── env.example
├── package.json
└── README.md
```

## 5. Configuration

`src/config/env.js` parses `process.env` with a Zod schema. The process exits
with an explicit error message if any required variable is missing or
malformed. This guarantees that the service never starts in an
half-configured state. Every variable is documented in `back-end/env.example`.

## 6. Request lifecycle

1. **Helmet, CORS, compression, JSON body parser, pino-http** apply globally.
2. The route enters `routes/index.js`, which mounts each domain router under
   `/api/<domain>`.
3. Domain routers attach:
   - `authenticate` — verifies the JWT and sets `req.user = { id, role }`.
   - `requireRole('employee'|'admin')` — guards role-restricted endpoints.
   - `validate(schema, source)` — runs the Zod schema; replaces
     `req.body | query | params` with the parsed (and coerced) value.
4. The controller calls a service and wraps the result in the standard
   success envelope (`{ success: true, data }`).
5. Any thrown `ApiError` (or unexpected `Error`) bubbles up to
   `error-handler.js`, which logs it and returns the standard error envelope
   (`{ success: false, error: { code, message } }`).

## 7. Authentication and authorisation

- **Sign-up**: `POST /api/auth/register` hashes the password with `bcryptjs`,
  inserts into `users`, then immediately seeds a synthetic row in
  `hr_profiles` (department, designation, resource allocation, etc.). The
  insert is wrapped in a MySQL transaction so a failure mid-flight does not
  leave a userless HR row or vice-versa.
- **Sign-in**: `POST /api/auth/login` issues a signed JWT containing the
  user's id (`sub`) and role.
- **Authorisation**: `authenticate` puts `req.user` in scope; `requireRole`
  enforces RBAC. Admin-only routers are wrapped at the router level
  (`router.use(authenticate, requireRole('admin'))`).

The JWT secret comes from `JWT_SECRET` and must be at least 16 characters
(enforced by the env schema). Token TTL is configured by `JWT_EXPIRES_IN`
(default `7d`).

## 8. Quiz scoring pipeline

`POST /api/quiz/submit` runs the multi-step pipeline defined in
`documents/general-flow.md` (Flow 2):

1. **Load** the active CBI quiz from MongoDB; reject submissions whose
   `quizVersion` does not match.
2. **Validate** the answers (correct count, valid question IDs, no
   duplicates, allowed scale values 0/25/50/75/100).
3. **Enrich** each response with its label, section, and reverse-scored
   `adjustedValue` if `reverseScored` is set on the question.
4. **Compute** section averages and the derived `mental_fatigue_score`:

   ```
   personalBurnoutAvg  = avg(personal questions)             (0–100)
   workBurnoutAvg      = avg(work-related questions)         (0–100)
   mentalFatigueScore  = ((personal + work) / 2) / 10        (0.0–10.0)
   ```

5. **Persist** the raw submission to MongoDB
   (`quiz_submissions`) — this happens *first* so we never lose answers if
   the AI call or MySQL insert fail. Cleanup on subsequent failure deletes
   the orphan document.
6. **Look up** the user's `hr_profile` to obtain `designation` and
   `resource_allocation`.
7. **Predict** burn rate via `services/ai.service.js`.
8. **Map** the burn rate to a risk level using the canonical thresholds:
   `low < 0.35 ≤ moderate < 0.55 ≤ high < 0.80 ≤ critical`.
9. **Insert** into `assessment_results` and run the alert rules — both
   inside one MySQL transaction.
10. **Back-link** `mysqlAssessmentId` onto the Mongo document.
11. **Return** `{ assessmentId, personalBurnoutScore, workBurnoutScore,
    mentalFatigueScore, predictedBurnRate, riskLevel }`.

## 9. Mock AI service

`services/ai.service.js` exposes a single function:

```js
predictBurnRate({ designation, resourceAllocation, mentalFatigueScore }) → number
```

Two implementations sit behind that API and are selected by an environment
variable:

| `AI_USE_MOCK` | Behaviour                                                   |
|---------------|-------------------------------------------------------------|
| `true`        | In-process mock that returns a deterministic-ish value.     |
| `false`       | HTTP `POST` to `${AI_SERVICE_URL}/api/predict` (Python).    |

The mock formula is intentionally simple and biased toward
`mentalFatigueScore` (the dominant signal in the training dataset):

```
burnRate = clamp01( 0.07 * mentalFatigueScore
                  + 0.03 * designation
                  + 0.02 * resourceAllocation
                  - 0.05
                  + uniformNoise(±0.025) )
```

The HTTP path uses `AbortController` with a timeout (`AI_SERVICE_TIMEOUT_MS`)
and propagates `5xx` responses as `ApiError.internal(...)`. **Switching to
the real Python service is a single env-var flip — no code changes** in the
quiz pipeline.

## 10. Alert rules

Implemented in `services/alert.service.js#maybeCreateAlerts`, executed inside
the same transaction that wrote the new `assessment_results` row:

| Condition                                       | Alert type      |
|-------------------------------------------------|-----------------|
| `risk_level === 'high'`                         | `high_risk`     |
| `risk_level === 'critical'`                     | `critical_risk` |
| `current.burnRate − previous.burnRate ≥ 0.15` *(env-tunable via `ALERT_TREND_SPIKE_DELTA`)* | `trend_spike` |

Both rules can fire from the same assessment, producing two rows in the
`alerts` table.

## 11. Dashboards

### 11.1 Employee dashboard (`GET /api/dashboard/employee`)

Bundles everything the employee UI needs into one round-trip:

- HR profile snapshot (department, designation, shift, etc.).
- Latest assessment result.
- Full burn-rate trend (chronological series for the line chart).
- Total assessment count.

### 11.2 Admin command centre (`GET /api/dashboard/admin`)

Computes:

- `companyOverview`: total active employees, total assessments, average
  burn rate, and risk distribution across the *latest* assessment per
  employee.
- `departments[]`: same metrics bucketed by department, including
  `highRiskCount` and a per-department risk distribution.
- `departmentKpis[]`: average composite KPI (mean of attendance,
  productivity, quality) per department, sourced from `employee_kpis` via
  `employee-kpi.repo.listAvgKpiPerDepartment()`.
- `recentAlerts[]`: 10 most recent alerts.

The latest-per-employee row set is produced with a single SQL query that
uses a correlated subquery to pick the most recent
`assessment_results.id` per user. It is then aggregated in JavaScript so
the heatmap can be rendered in one HTTP call.

### 11.3 Department drill-down

`GET /api/dashboard/admin/department/:departmentId` filters the same
latest-per-user dataset by department and pages the result. Employees are
shown by **anonymous ID** (`Worker #0001`, …) to satisfy the privacy
requirement in the thesis.

### 11.4 Department analytics (`GET /api/dashboard/admin/department/:departmentId/analytics`)

In addition to burn-rate aggregations (scatter, monthly trend, designation
and shift breakdowns, risk distribution), the analytics endpoint now
includes KPI data from `employee_kpis`:

- `avgKpiOverTime[]`: monthly department-wide averages of attendance,
  productivity, quality, and a composite KPI score.
- `kpiBurnRateOverTime[]`: monthly composite KPI alongside average burn
  rate for dual-axis comparison charts.

### 11.5 Admin employee detail (`GET /api/dashboard/admin/employees/:userId`)

Extended with:

- `kpiData[]`: the employee's monthly KPI snapshots (attendance,
  productivity, quality, overtime, tasks completed, days absent, composite).
- `kpiBurnRateComparison[]`: monthly composite KPI aligned with the
  employee's average burn rate per month, enabling Burn Rate vs Performance
  comparison charts.

## 12. Resources

The `help_resources` table stores curated mental-health links with a
threshold (`min_risk_level`). Two endpoints expose them:

- `GET /api/resources?riskLevel=…` (employee) — returns active resources
  whose threshold is **at or below** the requested level. If no level is
  supplied the backend looks up the user's latest assessment.
- `GET /api/admin/resources` plus full CRUD under `/api/admin/resources`
  (admin only).

## 13. Error handling

All errors funnel through one middleware:

```js
{ success: false, error: { code: "VALIDATION_ERROR", message: "..." } }
```

| Source                | Becomes                                 |
|-----------------------|-----------------------------------------|
| `ApiError.badRequest` | 400 / `VALIDATION_ERROR`                |
| Zod parse failure     | 400 / `VALIDATION_ERROR` (with details) |
| `authenticate` fail   | 401 / `UNAUTHORIZED`                    |
| `requireRole` fail    | 403 / `FORBIDDEN`                       |
| `ApiError.notFound`   | 404 / `NOT_FOUND`                       |
| MySQL `ER_DUP_ENTRY`  | 409 / `CONFLICT`                        |
| Anything else         | 500 / `INTERNAL_ERROR` (logged with stack) |

In non-production environments validation `details` are echoed back to help
the frontend during development.

## 14. Database design summary

### MySQL (`back-end/db/schema.sql`)

| Table                | Role                                       |
|----------------------|--------------------------------------------|
| `users`              | Auth + demographics                        |
| `departments`        | Lookup                                     |
| `hr_profiles`        | Simulated HR record (1:1 with `users`)     |
| `assessment_results` | One row per completed quiz                 |
| `alerts`             | Auto-generated risk notifications          |
| `help_resources`     | Curated mental-health resources            |

Foreign keys cascade on user delete so a developer wipe is straightforward.
Indexes:

- `users.email` UNIQUE
- `hr_profiles.user_id` UNIQUE
- `assessment_results (user_id, taken_at)` for trend queries
- `alerts (is_read, created_at)` for the unread-alert table
- `help_resources (is_active, min_risk_level)` for the resource lookup

### MongoDB

| Collection         | Document shape                                  |
|--------------------|-------------------------------------------------|
| `cbi_questions`    | The CBI quiz definition (questions, sections, response options, version, isActive). One active document at a time. |
| `quiz_submissions` | One document per quiz attempt, with all 13 enriched answers, section averages, and `mysqlAssessmentId` back-link. |

Storing answers as one document per submission (rather than one row per
answer in MySQL) preserves atomicity and matches MongoDB best practice.

## 15. Seeding

`scripts/seed.mjs` is idempotent and supports targeted runs:

```bash
npm run seed            # CBI quiz + admin user + help resources
npm run seed:quiz       # CBI quiz only
npm run seed:admin      # Admin user only
npm run seed:resources  # Help resources only
```

It reads the canonical CBI definition straight from
`mock-data/cbi-test.json`, hashes the admin password with bcrypt, and skips
records that already exist.

## 16. Operational notes

- **Bootstrapping order**: `server.js` first pings MySQL, then connects to
  MongoDB, then starts the HTTP listener. A failure at any step aborts
  startup — the orchestrator (PM2, Docker, etc.) sees a clean non-zero exit.
- **Graceful shutdown**: SIGINT/SIGTERM trigger `server.close()` followed by
  `closeMysql()` + `disconnectMongo()`.
- **Logging**: pretty-printed in development, structured JSON in production
  (`NODE_ENV=production`). Log level is set by `LOG_LEVEL`.
- **Security**: Helmet, CORS allow-list, body-size limit (256 KB), bcrypt
  cost factor configurable via `BCRYPT_SALT_ROUNDS`.

## 17. Future extensions

- **Refresh tokens** — currently only an access token is issued.
- **Rate limiting** — add `express-rate-limit` on `/auth/*` and `/quiz/submit`.
- **Audit log** — record admin mutations on `help_resources`.
- **Replace mock AI** — switch `AI_USE_MOCK=false` and point `AI_SERVICE_URL`
  at the deployed Python/FastAPI service. No application code changes
  required.
