# Frontend Architecture

This document describes the design of the React frontend that powers the
Industrial Employee Burnout Detection System. It is written so that it can be
copied into the thesis report with minimal editing: every section explains
what was built and *why*.

## 1. Goals and constraints

| Goal                                  | Implication                                                      |
|---------------------------------------|------------------------------------------------------------------|
| Desktop-only industrial dashboard     | No mobile breakpoints below 992 px; sidebar-based layout.        |
| Two distinct portals (Employee/Admin) | Separate route groups with role-based guards.                    |
| Claude-inspired warm visual identity  | Custom Tailwind v4 design-token theme; no cool grays anywhere.   |
| Thesis-grade code clarity             | Strict TypeScript, layered architecture, explicit type contracts. |

## 2. Technology stack

| Concern            | Choice                        | Rationale                                              |
|--------------------|-------------------------------|--------------------------------------------------------|
| Framework          | Next.js 16.2.4 (App Router)   | File-based routing, Turbopack, React 19 support        |
| UI library         | React 19.2.4                  | Latest stable; hooks-first API                         |
| Language           | TypeScript (strict mode)      | Compile-time safety for all API contracts              |
| Styling            | Tailwind CSS v4               | CSS-first `@theme` tokens, zero runtime cost           |
| Server state       | TanStack Query (React Query)  | Caching, retries, cache invalidation on mutations      |
| Forms              | react-hook-form + zod         | Performant uncontrolled forms with schema validation   |
| Charts             | Recharts                      | Composable React chart primitives                      |
| Icons              | lucide-react                  | Tree-shakeable SVG icon library                        |
| Utilities          | clsx + tailwind-merge         | Conditional class merging without conflicts            |

## 3. Layered structure

```
Browser
   │
   ▼
┌──────────────────────────── app/ pages ───────────────────────────┐
│  Next.js page components (one per route), "use client"            │
│  Compose UI components, consume TanStack Query hooks              │
└──────────────────────────────┬────────────────────────────────────┘
                               ▼
┌────────────────────── lib/hooks/ ─────────────────────────────────┐
│  Custom hooks wrapping useQuery / useMutation                     │
│  Define cache keys, invalidation rules, enabled conditions        │
└──────────────────────────────┬────────────────────────────────────┘
                               ▼
┌────────────────────── lib/api/ ───────────────────────────────────┐
│  Thin async functions (one per endpoint)                          │
│  Call apiFetch() with typed generics                              │
└──────────────────────────────┬────────────────────────────────────┘
                               ▼
┌────────────────────── lib/api/client.ts ──────────────────────────┐
│  Central fetch wrapper:                                           │
│  • Prefixes NEXT_PUBLIC_API_BASE_URL                              │
│  • Injects Authorization: Bearer <JWT> from localStorage          │
│  • Unwraps { success, data } envelope                             │
│  • Throws typed ApiError on failure                               │
│  • Clears auth + redirects on 401                                 │
└──────────────────────────────┬────────────────────────────────────┘
                               ▼
                    Express backend (:3000/api)
```

The strict layering keeps responsibilities pure:

- **Pages** know about layout and user interaction only.
- **Hooks** manage server state lifecycle (caching, refetching, optimistic updates).
- **API functions** are one-liner fetch calls with typed request/response shapes.
- **The client** owns transport concerns (auth header injection, error mapping).

## 4. Folder layout

```
front-end/
├── app/
│   ├── layout.tsx              # Root: Inter font, providers wrapper
│   ├── providers.tsx           # QueryProvider + AuthProvider + ToastProvider
│   ├── page.tsx                # Landing redirect (→ /login or role dashboard)
│   ├── globals.css             # Tailwind v4 @theme tokens (full Claude palette)
│   ├── (auth)/
│   │   ├── login/page.tsx      # Split-screen login form
│   │   └── register/page.tsx   # Split-screen registration form
│   ├── (employee)/
│   │   ├── layout.tsx          # Sidebar + RouteGuard (role=employee)
│   │   ├── dashboard/page.tsx  # Employee dashboard
│   │   ├── assessment/page.tsx # Two-step CBI quiz
│   │   ├── results/page.tsx    # Latest result + help resources
│   │   └── history/page.tsx    # Paginated past submissions
│   └── admin/
│       ├── layout.tsx          # Sidebar + RouteGuard (role=admin)
│       ├── dashboard/page.tsx  # Admin command centre
│       ├── departments/
│       │   └── [id]/page.tsx   # Department detail (Employees + Analytics tabs)
│       ├── employees/
│       │   ├── page.tsx        # Company-wide employee list (sortable)
│       │   └── [id]/page.tsx   # Single employee detail (gauge, trend, scores)
│       ├── alerts/page.tsx     # Filterable alerts inbox
│       └── resources/page.tsx  # Help resource CRUD
├── components/
│   ├── ui/                     # 15 reusable UI primitives
│   │   ├── Button.tsx          # 5 variants: primary, secondary, dark, ghost, danger
│   │   ├── Card.tsx            # Ivory surface with optional whisper shadow
│   │   ├── Input.tsx           # Rounded input with focus-blue ring
│   │   ├── Label.tsx           # Form label
│   │   ├── Select.tsx          # Styled native <select>
│   │   ├── Textarea.tsx        # Multi-line input
│   │   ├── Badge.tsx           # Risk-level pill (low/moderate/high/critical)
│   │   ├── ProgressBar.tsx     # Terracotta fill bar
│   │   ├── RadioGroup.tsx      # Large clickable option cards (quiz answers)
│   │   ├── Modal.tsx           # Overlay dialog with backdrop
│   │   ├── Table.tsx           # Table/Header/Body/Row/Head/Cell primitives
│   │   ├── Pagination.tsx      # Page navigation with prev/next
│   │   ├── Toast.tsx           # ToastProvider + useToast context
│   │   ├── EmptyState.tsx      # Icon + title + description + optional action
│   │   ├── Spinner.tsx         # Animated border spinner
│   │   └── Skeleton.tsx        # Pulse-animated placeholder
│   ├── charts/                       # 12 data visualisation components
│   │   ├── BurnRateGauge.tsx         # Custom SVG semicircle gauge with needle
│   │   ├── BurnRateLineChart.tsx     # Recharts line chart with threshold bands
│   │   ├── SectionScoreChart.tsx     # Bar chart (personal vs work burnout)
│   │   ├── RiskDistributionChart.tsx # Donut chart (company risk breakdown)
│   │   ├── DepartmentHeatmap.tsx     # Clickable tile grid coloured by burn rate
│   │   ├── DesignationBurnRateChart.tsx      # Bar chart: avg burn rate per designation level
│   │   ├── ShiftBurnRateChart.tsx            # Bar chart: avg burn rate per shift type
│   │   ├── EmployeeBurnRateScatter.tsx       # Scatter plot: all employees, colour-coded by risk
│   │   ├── MonthlyBurnRateChart.tsx          # Area chart: department burn rate trend over months
│   │   ├── KpiLineChart.tsx                  # Multi-line chart: attendance, productivity, quality over time
│   │   ├── KpiBurnRateComparisonChart.tsx    # Dual Y-axis composed chart: burn rate vs composite KPI
│   │   └── DepartmentKpiBarChart.tsx         # Bar chart: avg composite KPI per department
│   ├── layout/
│   │   ├── Sidebar.tsx         # Sticky left nav with role-based link sets
│   │   └── TopBar.tsx          # Page header with serif title and action slot
│   └── auth/
│       └── RouteGuard.tsx      # Role-based redirect wrapper
├── lib/
│   ├── api/                    # One file per backend domain
│   │   ├── client.ts           # Central fetch wrapper (JWT, envelope, errors)
│   │   ├── auth.ts             # login, register, getMe
│   │   ├── quiz.ts             # getQuiz, submitQuiz, getQuizHistory
│   │   ├── employee.ts         # getEmployeeDashboard, getResources
│   │   ├── admin.ts            # getAdminDashboard, getDepartmentDetail, getDepartmentAnalytics, getEmployeeList, getEmployeeDetail
│   │   ├── alerts.ts           # listAlerts, markAlertRead, markAllAlertsRead
│   │   └── resources.ts        # listAdminResources, create/update/deleteResource
│   ├── hooks/                  # TanStack Query wrappers
│   │   ├── useEmployeeDashboard.ts
│   │   ├── useQuiz.ts          # useQuiz, useSubmitQuiz, useQuizHistory
│   │   ├── useResources.ts
│   │   ├── useAdminDashboard.ts
│   │   ├── useDepartment.ts    # useDepartment (with sort/filter), useDepartmentAnalytics
│   │   ├── useEmployees.ts     # useEmployeeList, useEmployeeDetail
│   │   ├── useAlerts.ts        # useAlerts, useMarkAlertRead, useMarkAllAlertsRead
│   │   └── useAdminResources.ts # CRUD mutations with cache invalidation
│   ├── types.ts                # All TypeScript interfaces (mirrors backend API)
│   ├── risk.ts                 # Risk classification, colours, labels
│   ├── utils.ts                # cn() class merge helper
│   ├── auth-context.tsx        # AuthProvider + useAuth (JWT in localStorage)
│   └── query-client.tsx        # QueryClientProvider with default options
├── .env.local.example
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 5. Design system

The visual identity is inspired by Claude (Anthropic) and encoded entirely
as Tailwind v4 CSS custom properties in `globals.css`. Every colour in the
application traces back to one of these tokens — no ad-hoc hex values appear
in component code.

### Colour palette

| Token                  | Hex       | Role                                           |
|------------------------|-----------|-------------------------------------------------|
| `--color-parchment`    | `#f5f4ed` | Page background — warm cream evoking paper      |
| `--color-ivory`        | `#faf9f5` | Card surface, elevated containers               |
| `--color-sand`         | `#e8e6dc` | Secondary button background, active nav pill     |
| `--color-cream`        | `#f0eee6` | Borders, dividers                               |
| `--color-terracotta`   | `#c96442` | Primary CTA, brand accent                       |
| `--color-coral`        | `#d97757` | Text accent on dark surfaces                    |
| `--color-crimson`      | `#b53333` | Error states, danger actions                    |
| `--color-focus`        | `#3898ec` | Focus ring — the only cool colour in the system |
| `--color-near-black`   | `#141413` | Primary text — warm-tinted dark                 |
| `--color-olive`        | `#5e5d59` | Secondary body text                             |
| `--color-stone`        | `#87867f` | Tertiary text, metadata                         |
| `--color-risk-low`     | `#6b8f5f` | Low risk — muted green                          |
| `--color-risk-moderate`| `#c69a3d` | Moderate risk — warm amber                      |
| `--color-risk-high`    | `#c96442` | High risk — terracotta                          |
| `--color-risk-critical`| `#b53333` | Critical risk — crimson                         |

### Typography

- **Headlines**: Georgia serif, weight 500, tight line-heights (1.10–1.30).
  Used for page titles (`TopBar`), card headings, gauge labels, and the
  landing page hero text.
- **Body / UI**: Inter (sans-serif), weight 400–500, relaxed line-height
  (1.60). Used for navigation, form labels, table cells, and descriptions.
- **Code**: System monospace stack. Used only in data display (burn-rate
  values in tables).

### Component styling principles

- **Ring shadows** (`box-shadow: 0 0 0 1px`) replace traditional borders on
  interactive elements. Hover and focus states intensify the ring colour from
  `--color-ring-warm` to `--color-ring-deep`.
- **Whisper shadows** (`rgba(0,0,0,0.05) 0px 4px 24px`) provide subtle
  elevation for featured cards.
- **Border radius** follows a scale: 8 px (cards), 12 px (inputs, primary
  buttons), 16 px (featured containers), 32 px (hero elements).
- **No cool grays** — every neutral in the palette carries a yellow-brown
  undertone.

## 6. Authentication and route protection

### Auth flow

1. User submits credentials on `/login` (or registers on `/register`).
2. `AuthProvider` calls the backend, receives `{ token, user }`, persists
   both in `localStorage`, and sets React state.
3. The `apiFetch()` client reads the token from `localStorage` and attaches
   `Authorization: Bearer <token>` to every request.
4. On 401 response, the client clears `localStorage` and redirects to
   `/login`.

### Route guards

Each portal layout wraps its children in a `<RouteGuard>` component:

- `(employee)/layout.tsx` → `<RouteGuard requiredRole="employee">`
- `admin/layout.tsx` → `<RouteGuard requiredRole="admin">`

The guard checks `useAuth()` state:

- If loading → render a spinner.
- If unauthenticated → redirect to `/login`.
- If wrong role → redirect to the user's own dashboard.

### Landing page (`/`)

The root page reads auth state and immediately redirects:

- Not logged in → `/login`
- Employee → `/dashboard`
- Admin → `/admin/dashboard`

## 7. Data flow

All server communication follows the same pattern:

```
Page component
  → useXxx() hook (TanStack Query)
    → xxxApi() function (lib/api/)
      → apiFetch<T>() (lib/api/client.ts)
        → fetch() to Express backend
          → { success: true, data: T }
```

Mutations (quiz submit, alert mark-read, resource CRUD) use `useMutation`
and invalidate related query keys on success, keeping the UI automatically
fresh.

## 8. Pages — purpose and data sources

### 8.1 Login (`/login`)

**Purpose**: Authenticate an existing user and redirect to their portal.

- **Layout**: Split-screen — left panel shows a brand illustration with serif
  headline on parchment; right panel contains the form on ivory.
- **Form fields**: email, password (validated with zod).
- **API**: `POST /api/auth/login` → stores JWT → redirects by role.

### 8.2 Register (`/register`)

**Purpose**: Create a new employee account. The backend automatically
generates a simulated HR profile upon registration.

- **Layout**: Same split-screen as login.
- **Form fields**: first name, last name, email, password (min 6 chars),
  gender (select), date of birth.
- **API**: `POST /api/auth/register` → stores JWT → redirects to `/dashboard`.

### 8.3 Employee Dashboard (`/dashboard`)

**Purpose**: The central hub for the employee to see their current burnout
status, historical trends, and (if risk is high) access help resources.

- **API**: `GET /api/dashboard/employee`
- **Sections**:
  - **Profile card** — greeting with name, department, designation level,
    shift type.
  - **Burn Rate Gauge** — custom SVG semicircle gauge showing the latest
    `predictedBurnRate` (0–1) with a needle and colour-coded risk label.
  - **Section Scores** — bar chart comparing personal burnout vs.
    work-related burnout (both 0–100).
  - **Burn Rate Trend** — line chart plotting all historical burn rates over
    time with reference lines at the 0.35 / 0.55 / 0.80 risk thresholds.
  - **Get Help panel** — shown only when risk is high or critical; fetches
    `GET /api/resources?riskLevel=<level>` and displays resource cards that
    link out to external support.
  - **Empty state** — if no assessments exist, shows a CTA to take the first
    quiz.

### 8.4 Assessment (`/assessment`)

**Purpose**: Administer the 13-question Copenhagen Burnout Inventory (CBI)
as a two-step wizard.

- **API**: `GET /api/quiz` (load questions), `POST /api/quiz/submit` (submit
  answers)
- **Flow**:
  1. **Step 1 — Personal Burnout** (Questions 1–6): the user selects one of
     five response options (Always / Often / Sometimes / Seldom / Never) for
     each question using large clickable radio cards.
  2. **Step 2 — Work-Related Burnout** (Questions 7–13): same interaction.
     Question 10 is flagged as reverse-scored in the UI.
  3. A progress bar shows `Step N of 2`. The "Next" button is disabled until
     all questions in the current step are answered.
  4. On submit, the backend scores the quiz, calls the AI service, and
     returns the predicted burn rate.
  5. The user is redirected to `/results?assessmentId=<id>`.

### 8.5 Results (`/results`)

**Purpose**: Display the outcome of the most recent assessment with
contextual support resources.

- **API**: `GET /api/dashboard/employee` (for latest result),
  `GET /api/resources?riskLevel=<level>`
- **Sections**:
  - **Large Burn Rate Gauge** with the risk-level badge.
  - **Score cards** — three cards showing personal burnout score (0–100),
    work-related burnout score (0–100), and mental fatigue score (0–10).
  - **Support Resources** — cards with external links, shown for all risk
    levels (filtered by the backend based on `minRiskLevel`).
  - **Actions** — "Retake Assessment" and "View History" buttons.

### 8.6 History (`/history`)

**Purpose**: Let the employee review all past quiz submissions with detailed
per-question breakdowns.

- **API**: `GET /api/quiz/history?page=N&limit=10`
- **Layout**: A paginated table listing each submission's date, personal
  burnout average, work burnout average, and quiz version. Each row is
  expandable to reveal the 13 individual responses with labels and values.
  Reverse-scored answers are annotated.

### 8.7 Admin Dashboard (`/admin/dashboard`)

**Purpose**: The command centre for HR management to monitor factory-wide
burnout at a glance.

- **API**: `GET /api/dashboard/admin`
- **Sections**:
  - **KPI strip** — four stat cards: total employees, total assessments,
    average burn rate, and high-risk count (high + critical combined).
  - **Risk Distribution donut** — Recharts pie chart with four slices
    coloured by the risk-level tokens.
  - **Department Heatmap** — a tile grid where each department is coloured
    by its average burn rate (interpolated from low-green through
    critical-crimson). Clicking a tile navigates to the department drill-down.
  - **Department KPI Overview** — `DepartmentKpiBarChart` (bar chart) showing
    the average composite KPI per department, with tooltip breakdowns of
    attendance, productivity, and quality scores.
  - **Recent Alerts** — the 5 most recent alerts with type badge, message,
    department, and date. A "View all" link goes to `/admin/alerts`.

### 8.8 Department Detail (`/admin/departments/:id`)

**Purpose**: A two-tab view that lets the admin inspect a department's
employees and visualise burnout analytics.

- **Tab navigation**: Employees | Analytics, with a terracotta underline
  indicator on the active tab.

#### 8.8.1 Employees tab

- **API**: `GET /api/dashboard/admin/department/:id?page=N&limit=20&sort=…&order=…&riskLevel=…&shiftType=…&designation=…`
- **Features**:
  - **Filter bar** — three dropdowns to filter by risk level (`low` /
    `moderate` / `high` / `critical`), shift type (`Day` / `Night` /
    `Rotating`), and designation level (0–5). A "Clear filters" link resets
    all filters.
  - **Sortable columns** — clicking a column header toggles ascending /
    descending sort. Active sort shows a directional chevron icon. Sortable
    fields: Designation, Shift, Burn Rate, Risk, Last Assessment, Total.
  - **Clickable employee IDs** — the anonymous Worker ID is a link to
    `/admin/employees/:userId` for detailed drill-down.
  - **Pagination** — server-side pagination (20 per page).

#### 8.8.2 Analytics tab

- **API**: `GET /api/dashboard/admin/department/:id/analytics`
- **Sections**:
  - **Summary strip** — four stat cards: average burn rate, median burn
    rate, high/critical risk count (with percentage of department), and
    highest-risk designation level.
  - **Employee Burn Rate scatter** — `EmployeeBurnRateScatter` plots every
    employee's latest burn rate as a dot, colour-coded by risk level, with
    threshold reference lines at 0.35 / 0.55 / 0.80.
  - **Monthly Burn Rate trend** — `MonthlyBurnRateChart` (area chart)
    showing the department's average burn rate per month over time.
  - **By Designation** — `DesignationBurnRateChart` (bar chart) comparing
    average burn rate across designation levels 1–5.
  - **By Shift Type** — `ShiftBurnRateChart` (bar chart) comparing average
    burn rate across Day / Night / Rotating shifts.
  - **Risk Distribution** — `RiskDistributionChart` (donut chart) showing
    the department's low / moderate / high / critical breakdown.
  - **Average KPI Over Time** — `KpiLineChart` (multi-line chart) showing
    department-average attendance, productivity, and quality scores month by
    month.
  - **KPI vs Burn Rate** — `KpiBurnRateComparisonChart` (dual Y-axis
    composed chart) overlaying the department's monthly composite KPI with
    its average burn rate to reveal inverse correlations.

### 8.9 Employees (`/admin/employees`)

**Purpose**: Company-wide searchable and sortable employee list.

- **API**: `GET /api/dashboard/admin/employees?page=N&limit=20&sort=…&order=…`
- **Layout**: Paginated table with anonymous ID, department, designation,
  shift type, latest burn rate, risk badge, last assessment date, and
  assessment count. Clickable rows link to the employee detail page.

### 8.10 Employee Detail (`/admin/employees/:id`)

**Purpose**: Deep dive into a single employee's burnout history, shown
anonymously for the admin.

- **API**: `GET /api/dashboard/admin/employees/:userId`
- **Sections**:
  - **Burn Rate Gauge** — SVG semicircle gauge with the employee's latest
    burn rate and risk-level label.
  - **Burn Rate Trend** — line chart showing all historical burn rates over
    time with risk-threshold reference lines.
  - **Section Scores** — bar chart comparing the latest personal burnout
    vs. work-related burnout scores.
  - **Profile summary** — department, designation level, shift type.
  - **KPI Performance** — `KpiLineChart` (multi-line chart) showing the
    employee's monthly attendance, productivity, and quality scores.
  - **Burn Rate vs Performance** — `KpiBurnRateComparisonChart` (dual
    Y-axis composed chart) comparing the employee's monthly composite KPI
    against their burn rate trend.

### 8.11 Alerts (`/admin/alerts`)

**Purpose**: An inbox for system-generated risk alerts, with filtering and
bulk actions.

- **API**: `GET /api/alerts?isRead=…&alertType=…&page=N&limit=20`,
  `PATCH /api/alerts/:id/read`, `PATCH /api/alerts/read-all`
- **Features**:
  - **Filter bar** — dropdowns to filter by read status (all / unread /
    read) and alert type (critical_risk / high_risk / trend_spike).
  - **Alert table** — columns for type badge, department, message, date,
    read status, and a "Mark read" action button.
  - **Mark All Read** — header action that bulk-updates via
    `PATCH /api/alerts/read-all`.
  - Mutations use TanStack Query's `useMutation` with cache invalidation so
    the table updates instantly without a full refetch.

### 8.12 Admin Resources (`/admin/resources`)

**Purpose**: Full CRUD management for help resources that employees see based
on their risk level.

- **API**: `GET /api/admin/resources`, `POST /api/admin/resources`,
  `PUT /api/admin/resources/:id`, `DELETE /api/admin/resources/:id`
- **Features**:
  - **Resource table** — lists all resources with title, description,
    minimum risk level badge, active status, and URL.
  - **Create / Edit modal** — a form (title, description, URL, min risk
    level, active toggle) validated with zod.
  - **Delete** — confirmation prompt before deletion.
  - Toast notifications for successful create / update / delete operations.

## 9. Error and loading states

| Scenario              | Behaviour                                                        |
|-----------------------|------------------------------------------------------------------|
| First page load       | Skeleton placeholders (pulsing sand-coloured blocks)             |
| API error             | Inline error message in a crimson-tinted card                    |
| 401 Unauthorized      | `apiFetch` clears token from `localStorage`, redirects to login  |
| Empty data            | `EmptyState` component with icon, title, description, and CTA   |
| Mutation in progress  | Button shows a `Spinner`; disabled to prevent double-submit      |
| Toast notifications   | Auto-dismiss after 4 seconds; used for mutation confirmations    |

## 10. API endpoints consumed

| Method | Endpoint                                           | Used by page                    |
|--------|----------------------------------------------------|---------------------------------|
| POST   | `/api/auth/login`                                  | Login                           |
| POST   | `/api/auth/register`                               | Register                        |
| GET    | `/api/quiz`                                        | Assessment                      |
| POST   | `/api/quiz/submit`                                 | Assessment                      |
| GET    | `/api/quiz/history`                                | History                         |
| GET    | `/api/dashboard/employee`                          | Dashboard, Results              |
| GET    | `/api/resources`                                   | Dashboard, Results              |
| GET    | `/api/dashboard/admin`                             | Admin Dashboard                 |
| GET    | `/api/dashboard/admin/department/:id`              | Department Detail (Employees)   |
| GET    | `/api/dashboard/admin/department/:id/analytics`    | Department Detail (Analytics)   |
| GET    | `/api/dashboard/admin/employees`                   | Employees list                  |
| GET    | `/api/dashboard/admin/employees/:userId`           | Employee Detail                 |
| GET    | `/api/alerts`                                      | Alerts                          |
| PATCH  | `/api/alerts/:id/read`                             | Alerts                          |
| PATCH  | `/api/alerts/read-all`                             | Alerts                          |
| GET    | `/api/admin/resources`                             | Admin Resources                 |
| POST   | `/api/admin/resources`                             | Admin Resources                 |
| PUT    | `/api/admin/resources/:id`                         | Admin Resources                 |
| DELETE | `/api/admin/resources/:id`                         | Admin Resources                 |

## 11. Build output

The production build generates 15 routes:

| Route                       | Type    | Description                                 |
|-----------------------------|---------|---------------------------------------------|
| `/`                         | Static  | Redirect based on auth state                |
| `/login`                    | Static  | Login form                                  |
| `/register`                 | Static  | Registration form                           |
| `/dashboard`                | Static  | Employee dashboard                          |
| `/assessment`               | Static  | CBI quiz (two-step)                         |
| `/results`                  | Static  | Latest assessment result                    |
| `/history`                  | Static  | Past quiz submissions                       |
| `/admin/dashboard`          | Static  | Admin command centre                        |
| `/admin/departments/[id]`   | Dynamic | Department detail (Employees + Analytics)   |
| `/admin/employees`          | Static  | Company-wide employee list                  |
| `/admin/employees/[id]`     | Dynamic | Single employee detail                      |
| `/admin/alerts`             | Static  | Alerts inbox                                |
| `/admin/resources`          | Static  | Help resource management                    |

All pages are client-rendered (`"use client"`) because they depend on
`localStorage`-based authentication and TanStack Query hooks. Static in this
context means the HTML shell is pre-rendered; data is fetched client-side
after hydration.

## 12. Future extensions

- **Dark mode** — the design token system already defines dark surface
  colours; a theme toggle could switch CSS custom properties.
- **Real-time alerts** — WebSocket or SSE push from the backend when new
  alerts are generated, updating the admin inbox without polling.
- **Export reports** — add CSV/PDF download for department drill-down and
  assessment history.
- **Accessibility audit** — add ARIA labels to the custom gauge and
  heatmap components; run automated a11y testing.
