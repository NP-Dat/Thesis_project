# Backend API Reference

Base URL: `http://localhost:3000/api`

All responses use the envelope format:

```json
{
  "success": true,
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description"
  }
}
```

Common HTTP status codes: `200` OK, `201` Created, `400` Bad Request, `401` Unauthorized, `403` Forbidden, `404` Not Found, `500` Internal Server Error.

---

## 1. Authentication

### POST `/api/auth/register`

Register a new employee account. Automatically generates a simulated HR profile.

**Access:** Public

**Request body:**

```json
{
  "email": "worker@factory.com",
  "password": "securePass123",
  "firstName": "Nguyen",
  "lastName": "Dat",
  "gender": "Male",
  "dateOfBirth": "1995-08-15"
}
```

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "worker@factory.com",
      "firstName": "Nguyen",
      "lastName": "Dat",
      "gender": "Male",
      "role": "employee",
      "createdAt": "2026-05-03T00:00:00.000Z"
    }
  }
}
```

---

### POST `/api/auth/login`

Authenticate an existing user and receive a JWT.

**Access:** Public

**Request body:**

```json
{
  "email": "worker@factory.com",
  "password": "securePass123"
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "worker@factory.com",
      "firstName": "Nguyen",
      "lastName": "Dat",
      "gender": "Male",
      "role": "employee",
      "createdAt": "2026-05-03T00:00:00.000Z"
    }
  }
}
```

---

### GET `/api/auth/me`

Return the currently authenticated user's profile.

**Access:** Authenticated (any role)

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "worker@factory.com",
    "firstName": "Nguyen",
    "lastName": "Dat",
    "gender": "Male",
    "dateOfBirth": "1995-08-15",
    "role": "employee",
    "isActive": true,
    "createdAt": "2026-05-03T00:00:00.000Z"
  }
}
```

---

## 2. Quiz

### GET `/api/quiz`

Fetch the active CBI quiz (questions, sections, response options).

**Access:** Employee

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "quizId": "664a1b...",
    "name": "Copenhagen Burnout Inventory (excerpt)",
    "version": 1,
    "responseOptions": [
      { "label": "Always", "value": 100 },
      { "label": "Often", "value": 75 },
      { "label": "Sometimes", "value": 50 },
      { "label": "Seldom", "value": 25 },
      { "label": "Never/almost never", "value": 0 }
    ],
    "sections": [
      {
        "id": "personal_burnout",
        "title": "Personal burnout",
        "questionIds": [1, 2, 3, 4, 5, 6]
      },
      {
        "id": "work_related_burnout",
        "title": "Work-related burnout",
        "questionIds": [7, 8, 9, 10, 11, 12, 13]
      }
    ],
    "questions": [
      { "id": 1, "section": "personal_burnout", "text": "How often do you feel tired?" },
      { "id": 2, "section": "personal_burnout", "text": "How often are you physically exhausted?" },
      { "id": 3, "section": "personal_burnout", "text": "How often are you emotionally exhausted?" },
      { "id": 4, "section": "personal_burnout", "text": "How often do you think: \"I can't take it anymore?\"" },
      { "id": 5, "section": "personal_burnout", "text": "How often do you feel worn out?" },
      { "id": 6, "section": "personal_burnout", "text": "How often do you feel weak and susceptible to illness?" },
      { "id": 7, "section": "work_related_burnout", "text": "Do you feel worn out at the end of the working day?" },
      { "id": 8, "section": "work_related_burnout", "text": "Are you exhausted in the morning at the thought of another day at work?" },
      { "id": 9, "section": "work_related_burnout", "text": "Do you feel that every working hour is tiring for you?" },
      { "id": 10, "section": "work_related_burnout", "text": "Do you have enough energy for family and friends during leisure time?", "reverseScored": true },
      { "id": 11, "section": "work_related_burnout", "text": "Is your work emotionally exhausting?" },
      { "id": 12, "section": "work_related_burnout", "text": "Does your work frustrate you?" },
      { "id": 13, "section": "work_related_burnout", "text": "Do you feel burnt out because of your work?" }
    ]
  }
}
```

---

### POST `/api/quiz/submit`

Submit quiz answers. The backend calculates scores, calls the AI service, saves everything, and returns the prediction.

**Access:** Employee

**Headers:** `Authorization: Bearer <token>`

**Request body:**

```json
{
  "quizVersion": 1,
  "responses": [
    { "questionId": 1, "answerValue": 75 },
    { "questionId": 2, "answerValue": 50 },
    { "questionId": 3, "answerValue": 75 },
    { "questionId": 4, "answerValue": 50 },
    { "questionId": 5, "answerValue": 75 },
    { "questionId": 6, "answerValue": 25 },
    { "questionId": 7, "answerValue": 75 },
    { "questionId": 8, "answerValue": 50 },
    { "questionId": 9, "answerValue": 50 },
    { "questionId": 10, "answerValue": 25 },
    { "questionId": 11, "answerValue": 75 },
    { "questionId": 12, "answerValue": 50 },
    { "questionId": 13, "answerValue": 75 }
  ]
}
```

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "assessmentId": 42,
    "personalBurnoutScore": 58.33,
    "workBurnoutScore": 64.29,
    "mentalFatigueScore": 6.1,
    "predictedBurnRate": 0.54,
    "riskLevel": "moderate"
  }
}
```

---

### GET `/api/quiz/history`

Fetch all past quiz submissions for the current employee (raw answers stored in MongoDB).

**Access:** Employee

**Headers:** `Authorization: Bearer <token>`

**Query params:** `?page=1&limit=10`

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "submissions": [
      {
        "assessmentId": 42,
        "quizVersion": 1,
        "responses": [
          { "questionId": 1, "answerLabel": "Often", "answerValue": 75 },
          { "questionId": 10, "answerLabel": "Seldom", "rawValue": 25, "adjustedValue": 75, "reverseScored": true }
        ],
        "personalBurnoutAvg": 58.33,
        "workBurnoutAvg": 64.29,
        "submittedAt": "2026-05-03T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 1,
      "totalPages": 1
    }
  }
}
```

---

## 3. Employee Dashboard

### GET `/api/dashboard/employee`

Fetch everything the employee dashboard needs in a single call.

**Access:** Employee

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "profile": {
      "firstName": "Nguyen",
      "lastName": "Dat",
      "department": "Assembly Line A",
      "designation": 3,
      "resourceAllocation": 6,
      "shiftType": "Day",
      "dateOfJoining": "2024-01-15"
    },
    "latestAssessment": {
      "assessmentId": 42,
      "predictedBurnRate": 0.54,
      "riskLevel": "moderate",
      "personalBurnoutScore": 58.33,
      "workBurnoutScore": 64.29,
      "mentalFatigueScore": 6.1,
      "takenAt": "2026-05-03T10:30:00.000Z"
    },
    "trendData": [
      { "date": "2026-04-01", "burnRate": 0.35, "riskLevel": "moderate" },
      { "date": "2026-04-15", "burnRate": 0.42, "riskLevel": "moderate" },
      { "date": "2026-05-03", "burnRate": 0.54, "riskLevel": "moderate" }
    ],
    "totalAssessments": 3
  }
}
```

---

### GET `/api/resources`

Fetch help resources appropriate for the employee's current risk level.

**Access:** Employee

**Headers:** `Authorization: Bearer <token>`

**Query params:** `?riskLevel=high`

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "resources": [
      {
        "id": 1,
        "title": "National Mental Health Hotline",
        "description": "Free 24/7 support line for workers experiencing burnout or stress.",
        "url": "https://example.com/hotline",
        "minRiskLevel": "high"
      },
      {
        "id": 2,
        "title": "Stress Management Techniques",
        "description": "Evidence-based exercises for managing workplace fatigue.",
        "url": "https://example.com/stress-guide",
        "minRiskLevel": "moderate"
      }
    ]
  }
}
```

---

## 4. Admin Dashboard

### GET `/api/dashboard/admin`

Fetch the full admin command center data: department stats, company overview, and alerts.

**Access:** Admin

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "companyOverview": {
      "totalEmployees": 150,
      "totalAssessments": 420,
      "avgBurnRate": 0.41,
      "riskDistribution": {
        "low": 65,
        "moderate": 48,
        "high": 28,
        "critical": 9
      }
    },
    "departments": [
      {
        "id": 1,
        "name": "Assembly Line A",
        "location": "Building 1",
        "employeeCount": 35,
        "avgBurnRate": 0.52,
        "highRiskCount": 8,
        "riskDistribution": {
          "low": 10,
          "moderate": 12,
          "high": 8,
          "critical": 5
        }
      },
      {
        "id": 2,
        "name": "Maintenance",
        "location": "Building 2",
        "employeeCount": 20,
        "avgBurnRate": 0.33,
        "highRiskCount": 2,
        "riskDistribution": {
          "low": 12,
          "moderate": 6,
          "high": 2,
          "critical": 0
        }
      }
    ],
    "recentAlerts": [
      {
        "id": 101,
        "alertType": "critical_risk",
        "employeeName": "Worker #0047",
        "department": "Assembly Line A",
        "message": "Burn rate reached 0.91 — immediate intervention recommended.",
        "isRead": false,
        "createdAt": "2026-05-02T14:20:00.000Z"
      },
      {
        "id": 100,
        "alertType": "trend_spike",
        "employeeName": "Worker #0023",
        "department": "Quality Control",
        "message": "Burn rate jumped from 0.38 to 0.61 (+0.23) in 2 weeks.",
        "isRead": false,
        "createdAt": "2026-05-01T09:15:00.000Z"
      }
    ]
  }
}
```

---

### GET `/api/dashboard/admin/department/:departmentId`

Drill down into a single department. Returns an anonymised list of employees with their latest risk levels.

**Access:** Admin

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "department": {
      "id": 1,
      "name": "Assembly Line A",
      "location": "Building 1"
    },
    "employees": [
      {
        "anonymousId": "Worker #0047",
        "designation": 2,
        "shiftType": "Night",
        "latestBurnRate": 0.91,
        "riskLevel": "critical",
        "lastAssessmentDate": "2026-05-02T14:20:00.000Z",
        "assessmentCount": 5
      },
      {
        "anonymousId": "Worker #0012",
        "designation": 3,
        "shiftType": "Day",
        "latestBurnRate": 0.42,
        "riskLevel": "moderate",
        "lastAssessmentDate": "2026-04-28T08:00:00.000Z",
        "assessmentCount": 3
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 35,
      "totalPages": 2
    }
  }
}
```

---

## 5. Alerts

### GET `/api/alerts`

Fetch alerts for the admin panel. Supports filtering by read status and alert type.

**Access:** Admin

**Headers:** `Authorization: Bearer <token>`

**Query params:** `?isRead=false&alertType=critical_risk&page=1&limit=20`

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "alerts": [
      {
        "id": 101,
        "assessmentResultId": 42,
        "alertType": "critical_risk",
        "employeeName": "Worker #0047",
        "department": "Assembly Line A",
        "message": "Burn rate reached 0.91 — immediate intervention recommended.",
        "isRead": false,
        "createdAt": "2026-05-02T14:20:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalItems": 1,
      "totalPages": 1
    }
  }
}
```

---

### PATCH `/api/alerts/:alertId/read`

Mark a single alert as read.

**Access:** Admin

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": 101,
    "isRead": true
  }
}
```

---

### PATCH `/api/alerts/read-all`

Mark all unread alerts as read.

**Access:** Admin

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "updatedCount": 5
  }
}
```

---

## 6. Admin — Resource Management

### GET `/api/admin/resources`

List all help resources (including inactive ones).

**Access:** Admin

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "resources": [
      {
        "id": 1,
        "title": "National Mental Health Hotline",
        "description": "Free 24/7 support line.",
        "url": "https://example.com/hotline",
        "minRiskLevel": "high",
        "isActive": true,
        "createdAt": "2026-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

### POST `/api/admin/resources`

Create a new help resource.

**Access:** Admin

**Headers:** `Authorization: Bearer <token>`

**Request body:**

```json
{
  "title": "Workplace Wellness Program",
  "description": "Company-sponsored counseling sessions.",
  "url": "https://example.com/wellness",
  "minRiskLevel": "moderate"
}
```

**Response `201`:**

```json
{
  "success": true,
  "data": {
    "id": 3,
    "title": "Workplace Wellness Program",
    "description": "Company-sponsored counseling sessions.",
    "url": "https://example.com/wellness",
    "minRiskLevel": "moderate",
    "isActive": true,
    "createdAt": "2026-05-03T12:00:00.000Z"
  }
}
```

---

### PUT `/api/admin/resources/:resourceId`

Update an existing help resource.

**Access:** Admin

**Headers:** `Authorization: Bearer <token>`

**Request body:**

```json
{
  "title": "Updated Title",
  "description": "Updated description.",
  "url": "https://example.com/updated",
  "minRiskLevel": "high",
  "isActive": false
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "id": 3,
    "title": "Updated Title",
    "description": "Updated description.",
    "url": "https://example.com/updated",
    "minRiskLevel": "high",
    "isActive": false,
    "createdAt": "2026-05-03T12:00:00.000Z"
  }
}
```

---

### DELETE `/api/admin/resources/:resourceId`

Delete a help resource.

**Access:** Admin

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "message": "Resource deleted successfully."
  }
}
```

---

## 7. Python AI Microservice

Base URL: `http://localhost:8000`

This service is called **only** by the Express backend, never directly by the frontend.

### POST `/api/predict`

Run the trained ML model to predict burn rate.

**Caller:** Express backend (server-to-server)

**Request body:**

```json
{
  "designation": 3,
  "resourceAllocation": 6,
  "mentalFatigueScore": 6.1
}
```

**Response `200`:**

```json
{
  "success": true,
  "data": {
    "predictedBurnRate": 0.54
  }
}
```

---

### GET `/api/health`

Health check for the AI service.

**Caller:** Express backend / monitoring

**Response `200`:**

```json
{
  "status": "ok",
  "model": "random_forest_v1",
  "uptime": 3600
}
```

---

## API Route Summary

| Method | Route                                    | Access   | Purpose                            |
|--------|------------------------------------------|----------|------------------------------------|
| POST   | `/api/auth/register`                     | Public   | Create account + simulated HR data |
| POST   | `/api/auth/login`                        | Public   | Authenticate, get JWT              |
| GET    | `/api/auth/me`                           | Any      | Get current user profile           |
| GET    | `/api/quiz`                              | Employee | Fetch CBI quiz questions           |
| POST   | `/api/quiz/submit`                       | Employee | Submit answers, get prediction     |
| GET    | `/api/quiz/history`                      | Employee | Past quiz submissions (paginated)  |
| GET    | `/api/dashboard/employee`                | Employee | Employee dashboard data            |
| GET    | `/api/resources`                         | Employee | Help resources for risk level      |
| GET    | `/api/dashboard/admin`                   | Admin    | Admin command center overview      |
| GET    | `/api/dashboard/admin/department/:id`    | Admin    | Department drill-down              |
| GET    | `/api/alerts`                            | Admin    | List alerts (filterable)           |
| PATCH  | `/api/alerts/:alertId/read`              | Admin    | Mark alert as read                 |
| PATCH  | `/api/alerts/read-all`                   | Admin    | Mark all alerts as read            |
| GET    | `/api/admin/resources`                   | Admin    | List all help resources            |
| POST   | `/api/admin/resources`                   | Admin    | Create a help resource             |
| PUT    | `/api/admin/resources/:resourceId`       | Admin    | Update a help resource             |
| DELETE | `/api/admin/resources/:resourceId`       | Admin    | Delete a help resource             |
| POST   | `/api/predict` *(AI service)*            | Internal | Predict burn rate                  |
| GET    | `/api/health` *(AI service)*             | Internal | AI service health check            |
