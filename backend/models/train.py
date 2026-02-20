import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, IsolationForest
import joblib

MODEL_DIR = os.path.dirname(__file__)

def generate_synthetic_data(n_samples=1000):
    # Features: amount, time, v1, v2, v3
    np.random.seed(42)
    normal_data = np.random.randn(n_samples, 5)
    normal_data[:, 0] = np.abs(normal_data[:, 0]) * 100 # amount
    normal_data[:, 1] = np.abs(normal_data[:, 1]) * 1000 # time
    
    # Generate some anomalies
    n_outliers = int(n_samples * 0.05)
    outliers = np.random.uniform(low=-5, high=5, size=(n_outliers, 5))
    outliers[:, 0] = np.abs(outliers[:, 0]) * 1000 # huge amounts
    
    X = np.vstack([normal_data, outliers])
    y_normal = np.zeros(n_samples)
    y_outliers = np.ones(n_outliers)
    y = np.concatenate([y_normal, y_outliers])
    
    return X, y

def train_and_save_models():
    print("Generating synthetic transaction data...")
    X, y = generate_synthetic_data(2000)
    
    print("Training Random Forest...")
    rf = RandomForestClassifier(n_estimators=100, random_state=42)
    rf.fit(X, y)
    
    print("Training Isolation Forest...")
    # Isolation forest doesn't need labels
    iforest = IsolationForest(contamination=0.05, random_state=42)
    iforest.fit(X)
    
    rf_path = os.path.join(MODEL_DIR, "rf_model.pkl")
    if_path = os.path.join(MODEL_DIR, "if_model.pkl")
    
    joblib.dump(rf, rf_path)
    joblib.dump(iforest, if_path)
    print(f"Models saved to {MODEL_DIR}")

if __name__ == "__main__":
    train_and_save_models()
