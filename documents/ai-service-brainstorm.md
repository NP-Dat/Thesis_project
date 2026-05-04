# AI Service — Design & Approach

This document captures every design decision for the Python/FastAPI AI
microservice: what problem it solves, which algorithms we use and why, how
the training pipeline works, and how the service integrates with the existing
Node.js backend.

---

## 1. What the AI service does

The service has exactly **one responsibility**: accept three numeric features
about an employee and return a predicted **Burn Rate** (0.0–1.0).

### Input (3 features)

| Feature                | Source in our system | Range    |
|------------------------|----------------------|----------|
| `designation`          | `hr_profiles` table  | 1–5      |
| `resource_allocation`  | `hr_profiles` table  | 1–10     |
| `mental_fatigue_score` | CBI quiz calculation | 0.0–10.0 |

### Output

| Field              | Range   | Meaning                    |
|--------------------|---------|----------------------------|
| `predictedBurnRate`| 0.0–1.0 | Predicted burnout severity |

The Express backend then maps this number to a human-readable risk level:

| Risk level | Condition           |
|------------|---------------------|
| low        | burn_rate < 0.35    |
| moderate   | 0.35 ≤ burn_rate < 0.55 |
| high       | 0.55 ≤ burn_rate < 0.80 |
| critical   | burn_rate ≥ 0.80    |

The AI service does not know about users, quizzes, or risk labels — it is a
pure prediction function. All business logic stays in Node.js.

---

## 2. The dataset

We use the public Kaggle dataset **"Are Your Employees Burning Out?"**
(~22 000 rows). Each row represents one employee observation with the
following columns:

| Column                 | Type       | Notes                     |
|------------------------|------------|---------------------------|
| Employee ID            | string     | Not used for training     |
| Date of Joining        | date       | Not used for training     |
| Gender                 | category   | Not used for training     |
| Company Type           | category   | Not used for training     |
| WFH Setup Available    | category   | Not used for training     |
| **Designation**        | int (1–5)  | Feature 1                 |
| **Resource Allocation**| int (1–10) | Feature 2 (has nulls)     |
| **Mental Fatigue Score**| float (0–10) | Feature 3 (has nulls)  |
| **Burn Rate**          | float (0–1)| Target variable           |

### Why only 3 features?

Our application only has access to these three values at prediction time:

- **Designation** and **Resource Allocation** come from the simulated HR
  profile generated at registration. Because real factory HR databases are
  private and inaccessible, the backend seeds these values within the same
  ranges as the training dataset so the model always receives in-distribution
  inputs.
- **Mental Fatigue Score** is derived from the employee's CBI quiz answers.
  This is the only actively collected data point.

Columns like Gender, Company Type, and WFH Setup exist in the dataset but
our system does not feed them to the model. Keeping the feature set to three
makes the model simpler, more explainable, and directly aligned with what
the application actually collects.

### Handling missing values

The mock data shows that both `Resource Allocation` and
`Mental Fatigue Score` can be `null`. During training we handle this by:

1. **Dropping rows** where the target (`Burn Rate`) is null — we cannot
   train without a label.
2. **Imputing with the median** for `Resource Allocation` and
   `Mental Fatigue Score` — median is more robust to outliers than mean for
   ordinal/bounded scales.

At inference time, the Node.js backend coerces a null
`resource_allocation` to a sensible default (the midpoint 5) before calling
the Python service. This keeps the ML service strict: it always receives
clean, non-null inputs.

---

## 3. Problem type: regression

This is a **supervised regression** problem. The target variable
(`Burn Rate`) is a continuous value between 0 and 1. We are not
classifying employees into buckets — we are predicting a precise score.
The classification into risk levels (low/moderate/high/critical) happens
downstream in the Express backend using fixed thresholds, not inside the
model.

---

## 4. Algorithm selection

### 4.1 Primary model — Random Forest Regressor

**Random Forest** is an ensemble method that builds many decision trees on
random subsets of the data and averages their predictions. We chose it as
the primary model for these reasons:

| Reason                        | Explanation                                                                 |
|-------------------------------|-----------------------------------------------------------------------------|
| **Handles non-linearity**     | If the relationship between features and burn rate is not perfectly linear (e.g. a high Mental Fatigue Score combined with high Resource Allocation produces disproportionately worse outcomes), Random Forest captures these interaction effects naturally through its tree-based splits. Linear Regression cannot do this without manual feature engineering. |
| **Robust to outliers**        | Decision trees split on thresholds rather than fitting a global line, so a few extreme or noisy data points do not skew the entire model the way they would drag a regression line. |
| **No feature scaling needed** | Tree-based methods are invariant to the scale of input features. Whether designation runs 1–5 and resource allocation runs 1–10 does not matter — the splits work on rank order. Linear models can be sensitive to scale differences. |
| **Built-in feature importance**| Random Forest provides a straightforward measure of how much each feature contributes to reducing prediction error. This is valuable for the thesis write-up: we can produce a bar chart showing that `mental_fatigue_score` is the dominant predictor, which aligns with domain intuition (a psychologically exhausted worker burns out regardless of seniority). |
| **Good accuracy with small feature sets** | With only 3 features and ~22 000 rows, Random Forest delivers strong results without hyperparameter gymnastics. A few hundred trees with default settings typically reach near-optimal performance for tabular data this size. |
| **Interpretable enough for a thesis** | While not as transparent as a single linear equation, Random Forest is well-understood in academic literature and the feature importance output makes it easy to explain *what the model learned* to a thesis committee. |

### 4.2 Baseline model — Linear Regression

We train a **Linear Regression** model as a comparison baseline for
these reasons:

| Reason                        | Explanation                                                                 |
|-------------------------------|-----------------------------------------------------------------------------|
| **Simplest possible model**   | Linear Regression fits a straight-line equation: `burn_rate = w1*designation + w2*resource_allocation + w3*mental_fatigue_score + bias`. It is the textbook starting point for regression problems and gives us a lower bound on what a trivial model can achieve. |
| **Full transparency**         | The learned weights are directly readable. If `w3` (mental fatigue) is much larger than `w1` and `w2`, we can state exactly how much each unit increase in fatigue adds to the predicted burn rate. This is powerful for the thesis explanation. |
| **Establishes a performance floor** | If Random Forest only marginally beats Linear Regression, that tells us the relationships are mostly linear and a simple model would have sufficed. If Random Forest significantly outperforms, it proves that the non-linear interactions captured by the ensemble are genuinely valuable. Either outcome is a useful finding for the thesis. |
| **Fast to train and validate** | Takes milliseconds to fit, so it adds zero overhead to the experiment pipeline. |

### 4.3 Why not other algorithms?

| Algorithm                  | Why we did not choose it                                                    |
|---------------------------|-----------------------------------------------------------------------------|
| **Gradient Boosting (XGBoost / LightGBM)** | Typically the top performer for tabular data, but it is overkill for a 3-feature problem. The marginal accuracy gain over Random Forest would be tiny, while adding hyperparameter complexity (learning rate, max depth, regularisation) that is hard to justify in a thesis when simpler models already perform well. |
| **Neural Network / Deep Learning** | Requires vastly more data and tuning to outperform tree-based methods on structured tabular data. With only 3 numeric features, a neural network would be over-parameterised and harder to interpret — the opposite of what a thesis needs. |
| **Support Vector Regression (SVR)** | Sensitive to feature scaling, slower with large datasets, and harder to interpret. Offers no clear advantage over Random Forest for this problem shape. |
| **k-Nearest Neighbours (kNN)** | Performance degrades with noisy data, no built-in feature importance, and slower inference at scale. Not a good fit for a production microservice. |

---

## 5. Training pipeline

### 5.1 Steps

```
1.  Load the full Kaggle CSV (~22 000 rows)
2.  Select only the 3 feature columns + the target column
3.  Drop rows where Burn Rate (target) is null
4.  Impute nulls in Resource Allocation and Mental Fatigue Score with median
5.  Split into training (80%) and test (20%) sets, random_state=42 for reproducibility
6.  Train Linear Regression on the training set
7.  Train Random Forest Regressor on the training set
8.  Evaluate both models on the held-out test set
9.  Print comparison metrics (MAE, RMSE, R²)
10. Save the chosen model (Random Forest) to a .pkl file using joblib
```

### 5.2 Evaluation metrics

We report three complementary metrics:

| Metric | What it measures | Why it matters |
|--------|------------------|----------------|
| **MAE (Mean Absolute Error)** | Average absolute difference between predicted and actual burn rate. | Easy to interpret: "on average, the prediction is off by X." Since burn rate is 0–1, an MAE of 0.03 means the model is typically wrong by 3 percentage points. |
| **RMSE (Root Mean Squared Error)** | Square root of the average squared error. | Penalises large errors more heavily than MAE. If the model occasionally makes wildly wrong predictions, RMSE will be much higher than MAE, signalling inconsistency. |
| **R² (Coefficient of Determination)** | Proportion of variance in burn rate explained by the model. | An R² of 0.92 means the model explains 92% of the variation in burnout scores. Closer to 1.0 is better. This is the standard "goodness of fit" number for regression. |

### 5.3 Expected results (based on similar Kaggle notebooks)

Public notebooks on this dataset report R² scores in the 0.90–0.93 range
using Random Forest with all features. With only 3 features we might see
slightly lower numbers (perhaps 0.85–0.92) because we drop the secondary
signals. Linear Regression is expected to land 5–15 points lower than
Random Forest, demonstrating the value of the non-linear model.

### 5.4 Training deliverables

| Deliverable                        | Purpose                                      |
|------------------------------------|----------------------------------------------|
| `notebooks/training.ipynb`         | Full EDA, visualisations, model comparison — screenshots go into the thesis. |
| `train.py`                         | Standalone script to reproducibly retrain the model from the CSV.            |
| `model/burnout_model.pkl`          | Serialised Random Forest model loaded by the FastAPI service at startup.     |
| Comparison table (LR vs RF)        | Side-by-side MAE / RMSE / R² table for the thesis results chapter.           |
| Feature importance bar chart       | Visual proof of which feature matters most.                                  |

---

## 6. Exploratory Data Analysis (for the notebook)

The training notebook should include these visualisations:

1. **Distribution of Burn Rate** — histogram showing how burn rates are
   spread across the dataset. Helps the reader see that most employees
   cluster in the 0.2–0.6 range.
2. **Correlation heatmap** — 3×3 matrix of Pearson correlations between
   the features and the target. Expected to show `mental_fatigue_score`
   has the strongest correlation with `burn_rate`.
3. **Scatter plots** — each feature vs. burn rate (3 plots). These
   visually confirm linearity or non-linearity.
4. **Missing value summary** — bar chart showing null counts per column.
5. **Actual vs. Predicted scatter plot** — after training, plot predicted
   burn rate (y-axis) against actual burn rate (x-axis). A perfect model
   produces a 45-degree line; this shows how close we get.
6. **Feature importance bar chart** — from the Random Forest model,
   showing the relative contribution of each feature.
7. **Residual plot** — predicted burn rate vs. error. Checks that errors
   are randomly distributed (no systematic bias).

---

## 7. FastAPI service design

### 7.1 Architecture

The Python service is a thin HTTP wrapper around the saved model:

```
HTTP request
    │
    ▼
┌─────────────────────────────────────────────┐
│  FastAPI app                                │
│                                             │
│  POST /api/predict                          │
│    ├─ Validate input with Pydantic          │
│    ├─ Load pre-trained model (cached)       │
│    ├─ model.predict([[d, ra, mfs]])         │
│    ├─ Clamp result to [0, 1]               │
│    └─ Return { success, data }             │
│                                             │
│  GET /health                                │
│    └─ Return { status: "ok" }              │
└─────────────────────────────────────────────┘
```

### 7.2 API contract

**`POST /api/predict`**

Request body:

```json
{
  "designation": 3,
  "resource_allocation": 7,
  "mental_fatigue_score": 6.9
}
```

Response body (must match what `ai.service.js` expects):

```json
{
  "success": true,
  "data": {
    "predictedBurnRate": 0.52
  }
}
```

The Express backend parses `json.data.predictedBurnRate` — this shape is
already hardcoded in `back-end/src/services/ai.service.js` line 58.

**`GET /health`**

Response: `{ "status": "ok", "model": "random_forest_v1" }`

Used by Docker health checks and the Node.js backend to verify the AI
service is alive before routing predictions.

### 7.3 Input validation

Pydantic enforces strict ranges at the API boundary:

| Field                  | Type  | Constraint     |
|------------------------|-------|----------------|
| `designation`          | int   | 1 ≤ value ≤ 5  |
| `resource_allocation`  | float | 1 ≤ value ≤ 10 |
| `mental_fatigue_score` | float | 0 ≤ value ≤ 10 |

If any field is out of range or missing, FastAPI returns a 422 with
detailed validation errors automatically.

### 7.4 Model loading strategy

The `.pkl` file is loaded **once at startup** and cached in a module-level
variable. Every request reuses the same in-memory model. This avoids
disk I/O on every prediction and keeps response times under 10ms.

---

## 8. Integration with the Node.js backend

The integration is already built and waiting. `back-end/src/services/ai.service.js`
implements two modes controlled by an environment variable:

| `AI_USE_MOCK` | Behaviour                                                     |
|---------------|---------------------------------------------------------------|
| `true`        | Uses an in-process mock formula (current default for dev).    |
| `false`       | Sends HTTP `POST` to `${AI_SERVICE_URL}/api/predict`.         |

**Switching to the real Python service requires zero code changes** — just
set these two env vars:

```
AI_USE_MOCK=false
AI_SERVICE_URL=http://localhost:8000
```

### How the data flows (quiz submission)

```
Employee submits CBI quiz
    │
    ▼
Express: calculate mental_fatigue_score from 13 answers
    │
    ▼
Express: fetch designation + resource_allocation from hr_profiles
    │
    ▼
Express: call predictBurnRate({ designation, resourceAllocation, mentalFatigueScore })
    │
    ├─ if AI_USE_MOCK=true  → mock formula returns burn_rate
    └─ if AI_USE_MOCK=false → HTTP POST to Python → model.predict() → burn_rate
    │
    ▼
Express: map burn_rate to risk_level, save to assessment_results, trigger alerts
    │
    ▼
Return result to frontend
```

### Null handling agreement

The Node.js backend coerces `null` resource_allocation to a default (5)
**before** calling the Python service. The Python service expects all
three inputs to always be present and non-null. This keeps the
responsibility split clean.

### Timeout and error handling

The Express `realPredict` function uses `AbortController` with a
configurable timeout (`AI_SERVICE_TIMEOUT_MS`). If the Python service is
slow or down:

- Timeout fires → `AbortError` → wrapped as `ApiError.internal()`
- Non-2xx response → error message extracted → `ApiError.internal()`
- Malformed response → type check on `predictedBurnRate` fails → `ApiError.internal()`

The frontend receives a generic 500 error. A future improvement could
fall back to the mock formula so the app stays functional even when the
AI service is down.

---

## 9. Folder structure

```
ai-service/
├── data/
│   └── employee_burnout.csv          # Full Kaggle dataset (~22k rows)
├── model/
│   └── burnout_model.pkl             # Trained Random Forest (checked into repo)
├── notebooks/
│   └── training.ipynb                # EDA + model comparison (for thesis)
├── src/
│   ├── main.py                       # FastAPI app, /api/predict + /health
│   ├── predict.py                    # Model loading + prediction logic
│   └── config.py                     # Environment variables (HOST, PORT, MODEL_PATH)
├── train.py                          # Standalone training script
├── requirements.txt                  # fastapi, uvicorn, scikit-learn, joblib, pandas, numpy
└── README.md
```

---

## 10. Technology choices

| Concern           | Choice              | Rationale                                           |
|-------------------|---------------------|-----------------------------------------------------|
| Web framework     | FastAPI             | Async, auto-generated docs, Pydantic validation built in. |
| ML library        | scikit-learn        | Industry standard for classical ML. Random Forest and Linear Regression are both in `sklearn.ensemble` / `sklearn.linear_model`. |
| Model serialisation | joblib            | Recommended by scikit-learn for saving models. Faster than pickle for numpy arrays. |
| Data manipulation | pandas + numpy      | Standard Python data stack. Used in training only, not at inference time. |
| Server            | Uvicorn             | ASGI server for FastAPI. Lightweight, production-ready. |

---

## 11. What goes into the thesis from this work

| Thesis section         | Content from the AI service                                    |
|------------------------|----------------------------------------------------------------|
| **Literature review**  | Brief explanation of Random Forest and Linear Regression algorithms, why ensemble methods suit tabular data. |
| **Methodology**        | Feature selection justification (3 features), data cleaning steps, train/test split strategy, evaluation metrics. |
| **Implementation**     | FastAPI microservice architecture, model loading, API contract, integration with Express backend. |
| **Results**            | Comparison table (MAE, RMSE, R² for both models), feature importance chart, actual vs. predicted plot, residual analysis. |
| **Discussion**         | Why Random Forest outperformed Linear Regression, what the feature importance tells us about burnout drivers, limitations of using only 3 features. |

---

## 12. Implementation plan

| Step | Task                                                 | Notes                          |
|------|------------------------------------------------------|--------------------------------|
| 1    | Download the full Kaggle dataset                     | Place in `ai-service/data/`    |
| 2    | Create the Jupyter notebook with EDA                 | Distributions, correlations, scatter plots |
| 3    | Train both models in the notebook, compare metrics   | LR vs RF side-by-side          |
| 4    | Extract training code into `train.py`                | Reproducible, runs from CLI    |
| 5    | Export the Random Forest model to `.pkl`              | `joblib.dump()`                |
| 6    | Build the FastAPI service (`main.py`, `predict.py`)  | Load model, expose `/api/predict` |
| 7    | Test locally with sample curl requests               | Verify response shape matches  |
| 8    | Flip `AI_USE_MOCK=false` in Express and test end-to-end | Full quiz → prediction flow |
| 9    | Capture screenshots and tables for the thesis        | Plots from the notebook        |
