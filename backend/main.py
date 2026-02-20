from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os
import io

app = FastAPI(
    title="Fraud Detection API",
    description="API for classifying transactions and detecting anomalies. Copyright © Ahmad Al-Nazer.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Transaction(BaseModel):
    amount: float
    time: float
    v1: float
    v2: float
    v3: float

# Load Pre-trained models
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
RF_MODEL_PATH = os.path.join(MODEL_DIR, "rf_model.pkl")
IF_MODEL_PATH = os.path.join(MODEL_DIR, "if_model.pkl")

rf_model = None
if_model = None

@app.on_event("startup")
def load_models():
    global rf_model, if_model
    try:
        if os.path.exists(RF_MODEL_PATH):
            rf_model = joblib.load(RF_MODEL_PATH)
        if os.path.exists(IF_MODEL_PATH):
            if_model = joblib.load(IF_MODEL_PATH)
    except Exception as e:
        print(f"Error loading models: {e}")

@app.get("/")
def read_root():
    return {
        "message": "Fraud Detection API running.",
        "author": "Ahmad Al-Nazer",
        "linkedin": "www.linkedin.com/in/ahmadghazinazer"
    }

@app.post("/predict")
def predict_fraud(transaction: Transaction):
    if not rf_model or not if_model:
        raise HTTPException(status_code=500, detail="Models not loaded")

    features = np.array([[
        transaction.amount, 
        transaction.time, 
        transaction.v1, 
        transaction.v2, 
        transaction.v3
    ]])

    # Random Forest probability
    rf_prob = rf_model.predict_proba(features)[0][1]
    
    # Isolation Forest anomaly score
    if_score = if_model.decision_function(features)[0]

    is_fraud = bool(rf_prob > 0.5)
    
    return {
        "is_fraud": is_fraud,
        "risk_score": round(float(rf_prob * 100), 2),
        "anomaly_score": float(if_score),
        "red_flag": bool(if_score < 0)  # Isolation Forest outputs negative for anomalies
    }

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not rf_model or not if_model:
        raise HTTPException(status_code=500, detail="Models not loaded")
        
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
        
    contents = await file.read()
    try:
        # Read the CSV into a pandas dataframe
        df = pd.read_csv(io.BytesIO(contents))
        
        # Verify required columns exist
        required_cols = ['amount', 'time', 'v1', 'v2', 'v3']
        if not all(col in df.columns for col in required_cols):
            raise HTTPException(status_code=400, detail=f"CSV must contain columns: {', '.join(required_cols)}")
            
        features = df[required_cols].values
        
        # Run models on the batch
        rf_probs = rf_model.predict_proba(features)[:, 1]
        if_scores = if_model.decision_function(features)
        
        # Compile results
        results = []
        fraud_count = 0
        
        for i in range(len(df)):
            is_fraud = bool(rf_probs[i] > 0.5)
            is_anomaly = bool(if_scores[i] < 0)
            
            if is_fraud or is_anomaly:
                fraud_count += 1
                
            results.append({
                "row_index": i,
                "amount": float(df.iloc[i]['amount']),
                "time": float(df.iloc[i]['time']),
                "is_fraud": is_fraud,
                "risk_score": round(float(rf_probs[i] * 100), 2),
                "red_flag": is_anomaly
            })
            
        return {
            "filename": file.filename,
            "total_rows": len(df),
            "fraud_detected": fraud_count,
            "safe_detected": len(df) - fraud_count,
            "transactions": results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")
