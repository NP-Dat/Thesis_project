# General Application Flow

## System Overview

The application is a three-tier system: a **React** frontend, a **Node.js/Express** backend, and a **Python/FastAPI** AI microservice, backed by **MySQL** and **MongoDB** databases.

```
┌────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   React    │◄─────►│  Node.js/Express │◄─────►│  Python/FastAPI  │
│  Frontend  │ REST  │    Backend       │ REST  │   AI Service     │
└────────────┘       └───────┬──────────┘       └─────────────────┘
                          │        │
                     ┌────┘        └────┐
                     ▼                  ▼
               ┌──────────┐      ┌──────────┐
               │  MySQL   │      │ MongoDB  │
               └──────────┘      └──────────┘
```

---

## Flow 1: Employee Registration

```
User fills out registration form
        │
        ▼
POST /api/auth/register  ──►  Express Backend
        │
        ├─ 1. Validate input (email, password, name, gender)
        ├─ 2. Hash password with bcrypt
        ├─ 3. Insert row into MySQL `users` table
        ├─ 4. Generate simulated HR data:
        │      • Assign a random department
        │      • Generate designation (1–5)
        │      • Generate resource_allocation (1–10)
        │      • Set company_type, wfh_available, shift_type
        │      • Set date_of_joining
        ├─ 5. Insert row into MySQL `hr_profiles` table
        └─ 6. Return JWT token + user info
```

**Why simulate HR data?** Real factory HR databases are private and inaccessible. The backend seeds realistic values within the same ranges as the training dataset so the AI model receives valid inputs.

---

## Flow 2: Employee Takes the Burnout Quiz

```
Employee clicks "Take Assessment"
        │
        ▼
GET /api/quiz  ──►  Express Backend
        │
        ├─ 1. Fetch the active CBI quiz document from MongoDB `mdb_cbi_quiz`
        │      (13 questions, 2 sections, 5 response options)
        └─ 2. Return quiz payload to frontend

        ▼
Frontend renders the 13-question Copenhagen Burnout Inventory
        │
        ▼
Employee answers all questions and submits
        │
        ▼
POST /api/quiz/submit  ──►  Express Backend
        │
        ├─ 1. Receive array of 13 answers [{questionId, answerValue}, ...]
        │
        ├─ 2. Apply reverse scoring where needed
        │      (Question 10: adjustedValue = 100 - rawValue)
        │
        ├─ 3. Calculate section averages:
        │      • personal_burnout_avg  = avg of questions 1–6   (0–100)
        │      • work_burnout_avg      = avg of questions 7–13  (0–100)
        │
        ├─ 4. Calculate mental_fatigue_score:
        │      combined_avg = (personal_burnout_avg + work_burnout_avg) / 2
        │      mental_fatigue_score = combined_avg / 10    → scale 0.0–10.0
        │
        ├─ 5. Save raw submission to MongoDB `mdb_quiz_submissions`
        │      {
        │        mysql_user_id, quiz_version,
        │        responses: [...],
        │        personal_burnout_avg, work_burnout_avg,
        │        submitted_at
        │      }
        │
        ├─ 6. Fetch employee's hr_profile from MySQL
        │      → get designation and resource_allocation
        │
        ├─ 7. Call Python AI service ───────────────────────────┐
        │                                                       ▼
        │                                        POST /api/predict
        │                                        Body: {
        │                                          designation,
        │                                          resource_allocation,
        │                                          mental_fatigue_score
        │                                        }
        │                                               │
        │                                               ▼
        │                                        AI model predicts
        │                                        burn_rate (0.0–1.0)
        │                                               │
        │      ◄────────────────────────────────────────┘
        │
        ├─ 8. Determine risk_level from burn_rate:
        │      • low      → burn_rate < 0.35
        │      • moderate → 0.35 ≤ burn_rate < 0.55
        │      • high     → 0.55 ≤ burn_rate < 0.80
        │      • critical → burn_rate ≥ 0.80
        │
        ├─ 9. Save to MySQL `assessment_results`:
        │      {
        │        user_id, personal_burnout_score, work_burnout_score,
        │        mental_fatigue_score, predicted_burn_rate, risk_level
        │      }
        │
        ├─ 10. Update MongoDB submission with mysql_assessment_id
        │
        ├─ 11. If risk is high/critical OR burn_rate jumped ≥ 0.15
        │       since last assessment → insert into MySQL `alerts`
        │
        └─ 12. Return result to frontend:
               { burn_rate, risk_level, personal_burnout_avg, work_burnout_avg }
```

---

## Flow 3: Employee Views Their Dashboard

```
Employee navigates to Dashboard
        │
        ▼
GET /api/dashboard/employee  ──►  Express Backend
        │
        ├─ 1. Fetch user's hr_profile (designation, department, shift info)
        ├─ 2. Fetch all assessment_results for this user, ordered by taken_at
        ├─ 3. Fetch latest risk_level
        └─ 4. Return:
               • Current risk level and burn rate
               • Trend data (array of {date, burn_rate} for line chart)
               • Section breakdown (personal vs. work-related scores)

        ▼
Frontend renders:
        ├─ Risk level indicator (color-coded badge)
        ├─ Burn rate trend line chart over time
        ├─ Section score comparison (personal vs. work-related)
        └─ If risk ≥ high → show "Get Help" panel
                │
                ▼
           GET /api/resources?risk_level=high
                │
                └─ Returns curated help resources from `help_resources` table
```

---

## Flow 4: Admin/HR Views the Command Center

```
Admin logs in (role = "admin")
        │
        ▼
GET /api/dashboard/admin  ──►  Express Backend
        │
        ├─ 1. Aggregate latest assessment per employee
        │      JOIN with hr_profiles and departments
        │
        ├─ 2. Build department-level stats:
        │      For each department → {
        │        avg_burn_rate,
        │        employee_count,
        │        high_risk_count,
        │        risk_distribution: { low, moderate, high, critical }
        │      }
        │
        ├─ 3. Fetch unread alerts from `alerts` table
        │
        └─ 4. Return:
               • Department heatmap data
               • Company-wide risk distribution
               • High-risk alerts list

        ▼
Frontend renders:
        ├─ Department heatmap (color intensity = avg burn rate)
        ├─ Risk distribution pie/bar chart
        ├─ High-Risk Alerts table:
        │      │ Alert Type   │ Department     │ Message              │ Date       │
        │      │ critical     │ Assembly Line A│ Burn rate reached 0.9│ 2026-05-01 │
        └─ Drill-down: click department → see anonymised employee list with risk levels
```

---

## Flow 5: Alert Generation (Automatic)

```
After every assessment_result is saved (triggered in Flow 2, step 11):
        │
        ▼
Backend checks two conditions:
        │
        ├─ Condition A: risk_level is "high" or "critical"
        │      → Create alert with type = "high_risk" or "critical_risk"
        │
        └─ Condition B: Compare with previous assessment
               current_burn_rate - previous_burn_rate ≥ 0.15
               → Create alert with type = "trend_spike"
```

---

## Authentication Flow

```
Login:   POST /api/auth/login   → validate credentials → return JWT
Logout:  Client discards JWT

Every protected request:
        │
        ▼
Client sends: Authorization: Bearer <JWT>
        │
        ▼
Express middleware verifies token
        ├─ Valid   → extract user_id and role, proceed
        ├─ Expired → 401 Unauthorized
        └─ Invalid → 401 Unauthorized

Role-based access:
        ├─ Employee routes: require role = "employee"
        ├─ Admin routes:    require role = "admin"
        └─ Shared routes:   require any authenticated user
```

---

## Database Interaction Summary

| Action                  | MySQL                        | MongoDB                    |
|-------------------------|------------------------------|----------------------------|
| Register user           | `users` + `hr_profiles`      | —                          |
| Fetch quiz questions    | —                            | `mdb_cbi_quiz`             |
| Submit quiz answers     | `assessment_results`         | `mdb_quiz_submissions`     |
| Generate alert          | `alerts`                     | —                          |
| Employee dashboard      | `assessment_results`         | —                          |
| Admin heatmap           | `assessment_results` + `hr_profiles` + `departments` | —    |
| Get help resources      | `help_resources`             | —                          |

---

## AI Model Input/Output

**Input** (3 features, sent from Express to FastAPI):

| Feature                | Source         | Range    |
|------------------------|----------------|----------|
| `designation`          | `hr_profiles`  | 1–5      |
| `resource_allocation`  | `hr_profiles`  | 1–10     |
| `mental_fatigue_score` | CBI quiz calc  | 0.0–10.0 |

**Output**:

| Field             | Range    | Meaning                          |
|-------------------|----------|----------------------------------|
| `burn_rate`       | 0.0–1.0  | Predicted burnout severity       |
