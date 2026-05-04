# AI Service — Setup & Testing Guide

Step-by-step instructions to set up, train, run, and test the Python/FastAPI burnout prediction microservice, then wire it to the Express backend.

---

## Prerequisites

- Python 3.12 (already installed — the venv at `ai-service/.venv` uses it)
- The Kaggle dataset at `archive/employee_burnout_analysis-AI.xlsx` (already in the repo)
- Node.js backend set up and running (for end-to-end testing)

---

## 1. Activate the Virtual Environment

Open a terminal in the `ai-service/` folder:

```powershell
cd ai-service
.\.venv\Scripts\Activate.ps1
```

You should see `(.venv)` in your prompt.

---

## 2. Install Dependencies

```powershell
pip install -r requirements.txt
```

This installs FastAPI, uvicorn, scikit-learn, pandas, matplotlib, seaborn, jupyter, and related packages.

---

## 3. Train the Model

```powershell
python train.py
```

**What it does:**
1. Reads the Kaggle xlsx dataset from `../archive/employee_burnout_analysis-AI.xlsx`
2. Selects 3 features: `Designation`, `Resource Allocation`, `Mental Fatigue Score`
3. Drops rows with null target (`Burn Rate`), median-imputes null features
4. Splits 80/20 with `random_state=42`
5. Trains Linear Regression (baseline) and Random Forest (primary)
6. Prints a comparison table (MAE, RMSE, R²)
7. Saves the Random Forest model to `model/burnout_model.pkl`

**Expected output (approximate):**

```
Model              MAE     RMSE    R²
Linear Regression  0.0539  0.0716  0.8656
Random Forest      0.0480  0.0611  0.9019
```

**Expected time:** ~15 seconds.

---

## 4. Run the Jupyter Notebook (for thesis screenshots)

```powershell
jupyter notebook notebooks/training.ipynb
```

The notebook contains the full EDA and model comparison used for the thesis:

1. Dataset overview (`head()`, `info()`, `describe()`)
2. Missing value bar chart
3. Burn Rate distribution histogram
4. Pearson correlation heatmap (4x4 matrix)
5. Scatter plots (each feature vs burn rate)
6. Data preprocessing (drop nulls, median impute)
7. Train/test split
8. Linear Regression training + metrics
9. Random Forest training + metrics
10. Side-by-side comparison table
11. Feature importance bar chart
12. Actual vs Predicted scatter plots (both models)
13. Residual analysis (residuals vs predicted + distribution)
14. Save model

Run all cells top-to-bottom. Take screenshots for the thesis chapters.

---

## 5. Start the AI Service

```powershell
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

For development with auto-reload:

```powershell
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The model is loaded at startup. You should see:

```
INFO | Loading model from .../model/burnout_model.pkl
INFO | Model loaded successfully
INFO | Model ready, accepting requests
INFO | Uvicorn running on http://0.0.0.0:8000
```

**Swagger UI:** Open http://localhost:8000/docs in a browser.

---

## 6. Smoke-Test the Endpoints

### 6.1 Health Check

```powershell
Invoke-RestMethod -Uri "http://localhost:8000/api/health" -Method GET | ConvertTo-Json
```

Expected:

```json
{
    "status": "ok",
    "model": "random_forest_v1",
    "uptime": 12.3
}
```

### 6.2 Prediction

```powershell
$body = '{"designation": 3, "resourceAllocation": 7, "mentalFatigueScore": 6.9}'
Invoke-RestMethod -Uri "http://localhost:8000/api/predict" -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json
```

Expected:

```json
{
    "success": true,
    "data": {
        "predictedBurnRate": 0.5789
    }
}
```

The `predictedBurnRate` is the model's prediction (0.0-1.0). For context, designation=3, resourceAllocation=7, mentalFatigueScore=6.9 corresponds to a "high" risk employee (burn rate >= 0.55).

### 6.3 Validation Error

```powershell
$body = '{"designation": 0, "resourceAllocation": 7, "mentalFatigueScore": 6.9}'
Invoke-RestMethod -Uri "http://localhost:8000/api/predict" -Method POST -Body $body -ContentType "application/json"
```

Expected: 422 error with message about designation being out of range (must be 1-5).

### 6.4 Test with Different Inputs

| Input | Expected Risk |
|-------|---------------|
| `{"designation": 1, "resourceAllocation": 2, "mentalFatigueScore": 2.0}` | low (< 0.35) |
| `{"designation": 2, "resourceAllocation": 4, "mentalFatigueScore": 5.0}` | moderate (0.35-0.55) |
| `{"designation": 3, "resourceAllocation": 7, "mentalFatigueScore": 6.9}` | high (0.55-0.80) |
| `{"designation": 5, "resourceAllocation": 10, "mentalFatigueScore": 9.5}` | critical (>= 0.80) |

---

## 7. Wire to the Express Backend

The Express backend is already coded to call the AI service. To switch from the mock formula to the real model:

### 7.1 Edit `back-end/.env`

Change (or add) these two variables:

```env
AI_USE_MOCK=false
AI_SERVICE_URL=http://localhost:8000
```

### 7.2 Restart the Node server

```powershell
cd ..\back-end
npm run dev
```

### 7.3 End-to-end test

1. Make sure the AI service is running on port 8000
2. Make sure the Express backend is running on port 3000
3. Log in as the test employee (`worker1@factory.com` / `Test1234!`)
4. Take the CBI burnout quiz (13 questions)
5. Submit — the backend now calls `POST http://localhost:8000/api/predict` instead of the mock formula
6. Check the result: burn rate, risk level, and dashboard should reflect the ML model's prediction

### 7.4 Verify in backend logs

The Express backend logs will show:

```
AI prediction { mode: 'http', burnRate: 0.54, input: {...} }
```

Instead of:

```
AI prediction { mode: 'mock', burnRate: 0.52, input: {...} }
```

---

## 8. Re-training the Model

If you modify `train.py` or want to retrain:

```powershell
python train.py
```

This overwrites `model/burnout_model.pkl`. Restart the FastAPI service to load the new model.

---

## 9. File Structure Reference

```
ai-service/
├── .venv/                          Python 3.12 virtual environment
├── .gitignore
├── README.md
├── requirements.txt                All Python dependencies
├── train.py                        Standalone training script (CLI)
├── model/
│   └── burnout_model.pkl           Trained Random Forest model
├── notebooks/
│   └── training.ipynb              EDA + model comparison (for thesis)
└── src/
    ├── __init__.py
    ├── config.py                   Settings (pydantic-settings, reads .env)
    ├── main.py                     FastAPI app (routes, lifespan, CORS)
    ├── predict.py                  Model loading + prediction logic
    └── schemas.py                  Pydantic request/response models
```

---

## 10. Troubleshooting

### Model file not found

```
FileNotFoundError: model/burnout_model.pkl
```

Run `python train.py` first to generate the model file.

### Port 8000 already in use

```
ERROR: [Errno 10048] error while attempting to bind on address ('0.0.0.0', 8000)
```

Find and kill the process using port 8000:

```powershell
netstat -ano | findstr ":8000"
Stop-Process -Id <PID> -Force
```

Or use a different port:

```powershell
uvicorn src.main:app --port 8001
```

(Update `AI_SERVICE_URL=http://localhost:8001` in `back-end/.env` accordingly.)

### openpyxl not installed

```
ImportError: Missing optional dependency 'openpyxl'
```

```powershell
pip install openpyxl
```

### sklearn version warning on unpickling

If you see a warning about scikit-learn versions when loading the model, it's usually harmless. To fix it permanently, retrain the model with the current version:

```powershell
python train.py
```

### CORS errors in browser

The service allows CORS from `http://localhost:3000` and `http://localhost:5173`. The frontend does not call the AI service directly (the Express backend does), so CORS errors should not happen in normal operation. If you're testing from the browser's Swagger UI at `http://localhost:8000/docs`, CORS is already configured.

### Express backend can't reach AI service

Make sure:
1. The AI service is running (`uvicorn src.main:app --port 8000`)
2. `AI_SERVICE_URL=http://localhost:8000` is set in `back-end/.env`
3. `AI_USE_MOCK=false` is set in `back-end/.env`
4. The Express backend was restarted after changing `.env`
