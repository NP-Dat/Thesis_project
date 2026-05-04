"""
Reproducible training script for the burnout prediction model.

Reads the Kaggle xlsx dataset, trains Linear Regression (baseline) and
Random Forest Regressor (primary), prints a comparison table, and saves
the Random Forest model to disk.

Usage:
    python train.py
"""

import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import train_test_split

sys.path.insert(0, str(Path(__file__).resolve().parent))
from src.config import settings

FEATURE_COLS = ["designation", "resource_allocation", "mental_fatigue_score"]
TARGET_COL = "burn_rate"

COLUMN_RENAME = {
    "Designation": "designation",
    "Resource Allocation": "resource_allocation",
    "Mental Fatigue Score": "mental_fatigue_score",
    "Burn Rate": "burn_rate",
}


def load_and_preprocess(path: str) -> pd.DataFrame:
    df = pd.read_excel(path, engine="openpyxl")
    df = df.rename(columns=COLUMN_RENAME)

    keep = FEATURE_COLS + [TARGET_COL]
    missing = [c for c in keep if c not in df.columns]
    if missing:
        raise ValueError(f"Missing columns in dataset: {missing}")
    df = df[keep]

    before = len(df)
    df = df.dropna(subset=[TARGET_COL])
    dropped = before - len(df)
    if dropped:
        print(f"  Dropped {dropped} rows with null target")

    for col in ["resource_allocation", "mental_fatigue_score"]:
        nulls = df[col].isna().sum()
        if nulls:
            median = df[col].median()
            df[col] = df[col].fillna(median)
            print(f"  Imputed {nulls} nulls in {col} with median={median}")

    return df


def evaluate(name: str, y_true, y_pred) -> dict:
    mae = mean_absolute_error(y_true, y_pred)
    rmse = np.sqrt(mean_squared_error(y_true, y_pred))
    r2 = r2_score(y_true, y_pred)
    return {"Model": name, "MAE": f"{mae:.4f}", "RMSE": f"{rmse:.4f}", "R²": f"{r2:.4f}"}


def main():
    dataset_path = settings.DATASET_PATH
    model_path = settings.MODEL_PATH

    print(f"\n{'='*60}")
    print("  Burnout Prediction — Model Training")
    print(f"{'='*60}")
    print(f"\n  Dataset : {dataset_path}")
    print(f"  Output  : {model_path}\n")

    print("Step 1: Loading and preprocessing...")
    df = load_and_preprocess(dataset_path)
    print(f"  Final dataset: {len(df)} rows, {len(df.columns)} columns\n")

    X = df[FEATURE_COLS]
    y = df[TARGET_COL]

    print("Step 2: Splitting 80/20 (random_state=42)...")
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    print(f"  Train: {len(X_train)} rows")
    print(f"  Test:  {len(X_test)} rows\n")

    print("Step 3: Training Linear Regression (baseline)...")
    lr = LinearRegression()
    lr.fit(X_train, y_train)
    lr_pred = lr.predict(X_test)
    lr_metrics = evaluate("Linear Regression", y_test, lr_pred)
    print("  Done.\n")

    print("Step 4: Training Random Forest (n_estimators=200, random_state=42)...")
    rf = RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1)
    rf.fit(X_train, y_train)
    rf_pred = rf.predict(X_test)
    rf_metrics = evaluate("Random Forest", y_test, rf_pred)
    print("  Done.\n")

    print("Step 5: Model comparison")
    results = pd.DataFrame([lr_metrics, rf_metrics])
    print(results.to_string(index=False))

    print(f"\n  Linear Regression coefficients:")
    for feat, coef in zip(FEATURE_COLS, lr.coef_):
        print(f"    {feat}: {coef:.4f}")
    print(f"    intercept: {lr.intercept_:.4f}")

    print(f"\n  Random Forest feature importances:")
    for feat, imp in zip(FEATURE_COLS, rf.feature_importances_):
        print(f"    {feat}: {imp:.4f}")

    print(f"\nStep 6: Saving Random Forest model to {model_path}...")
    Path(model_path).parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(rf, model_path)
    print("  Saved.\n")

    print(f"{'='*60}")
    print("  Training complete!")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
