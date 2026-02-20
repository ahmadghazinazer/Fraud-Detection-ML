# Fraud-Detection-ML

An enterprise-grade Fraud Detection and Risk Analysis Machine Learning platform. This project provides a comprehensive solution for detecting anomalies, red flags, and classifying high-risk transactions using a dual-model approach with Scikit-learn, served by a blazing fast Python FastAPI backend and visualized on a premium, responsive React Dashboard.

## 🚀 Features

- **Advanced Machine Learning Models:**
  - **Random Forest:** Supervised classification providing highly accurate risk scoring based on historical transaction patterns.
  - **Isolation Forest:** Unsupervised anomaly detection that flags previously unseen, suspicious behavior (zero-day fraud).
- **High-Performance FastAPI Backend:** Ultra-fast, lightweight API allowing seamless, real-time data ingestion for scoring.
- **Premium React Dashboard:** Fully responsive, modern Vite-based frontend developed with Vanilla CSS featuring:
  - Glassmorphism & dark aesthetic for a professional appearance.
  - Seamless gradient data visualization with `recharts`.
  - Real-time statistics tracking system health, anomaly volume, and total transactions.
- **Secure by Design:** Strictly structured API endpoints and sanitized synthetic training pipelines.

## 💻 Tech Stack

- **Backend:** Python 3, FastAPI, Uvicorn, Scikit-learn, Pandas, Numpy.
- **Frontend:** React, Vite, Recharts, Lucide React, Vanilla CSS.

## 🛠️ Usage & Installation

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python models/train.py   # Generate initial ML models
uvicorn main:app --reload # Start the API server on port 8000
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev # Start the React Dashboard
```

## 📜 Copyright Information

This project is proprietary and is strictly developed, maintained, and copyrighted by **Ahmad Al-Nazer**.
- **Developer:** Ahmad Al-Nazer
- **Connect:** [LinkedIn Profile](https://www.linkedin.com/in/ahmadghazinazer)

All rights reserved. Unauthorized copying or redistribution of this software, via any medium, is strictly prohibited.
