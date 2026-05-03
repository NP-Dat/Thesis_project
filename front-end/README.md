# Burnout Detection System — Frontend

Desktop-only Next.js 16 / React 19 / Tailwind v4 frontend for the Industrial Employee Burnout Detection System.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Start dev server (default port 3001 to avoid conflict with Express on 3000)
npm run dev
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3000/api` | Express backend base URL |

## Routes

| Path | Role | Description |
|---|---|---|
| `/login` | Public | Employee / Admin login |
| `/register` | Public | Employee registration |
| `/dashboard` | Employee | Personal dashboard with burn-rate gauge and trend chart |
| `/assessment` | Employee | Two-step CBI quiz (Personal + Work-related burnout) |
| `/results` | Employee | Latest assessment result with support resources |
| `/history` | Employee | Paginated quiz submission history |
| `/admin/dashboard` | Admin | Command center: KPIs, risk donut, department heatmap |
| `/admin/departments/:id` | Admin | Department drill-down with anonymised employee table |
| `/admin/alerts` | Admin | Filterable alerts inbox with mark-read actions |
| `/admin/resources` | Admin | CRUD for help resources |

## Tech Stack

- **Next.js 16.2.4** (App Router, Turbopack)
- **React 19** + TypeScript strict
- **Tailwind CSS v4** with Claude-inspired warm parchment design tokens
- **TanStack Query** for server state
- **react-hook-form** + **zod** for form validation
- **Recharts** for charts (line, bar, donut, custom SVG gauge)
- **lucide-react** for icons
