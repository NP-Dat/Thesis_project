# Burnout Detection — Backend

Express 5 + MySQL + MongoDB API for the Industrial Employee Burnout Detection
System. The Python/FastAPI ML service is stubbed in-process; flip
`AI_USE_MOCK=false` once the real service is deployed.

## Prerequisites

- Node.js ≥ 18.17
- MySQL 8.x reachable from the backend (cloud-managed is fine)
- MongoDB reachable from the backend (Atlas, self-hosted, etc.)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in real values
cp env.example .env

# 3. Create the MySQL schema and reference data manually on your DB:
#    paste/run db/schema.sql in your cloud console.

# 4. Seed the CBI quiz (MongoDB) + the admin user (MySQL)
npm run seed

# 5. Start in dev mode (auto-reload)
npm run dev
```

## NPM scripts

| Script               | Purpose                                          |
|----------------------|--------------------------------------------------|
| `npm start`          | Start the production server                      |
| `npm run dev`        | Start with `nodemon`                             |
| `npm run seed`       | Seed CBI quiz + admin user + default resources   |
| `npm run seed:quiz`  | Seed only the CBI quiz                           |
| `npm run seed:admin` | Seed only the admin user                         |
| `npm run seed:resources` | Re-seed default help resources               |

## API

See `documents/backend-api.md` for the full reference. Base URL:
`http://localhost:3000/api`.

## Architecture

See `documents/backend-architecture.md`.
