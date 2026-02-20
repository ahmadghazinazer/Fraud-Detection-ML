import React, { useState, useEffect, useRef } from 'react';
import { Shield, AlertTriangle, Activity, Database, Server, CheckCircle, UploadCloud, FileSpreadsheet } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Synthetic data for the charts
const chartData = [
  { time: '00:00', safe: 400, fraud: 24 },
  { time: '04:00', safe: 300, fraud: 13 },
  { time: '08:00', safe: 550, fraud: 98 },
  { time: '12:00', safe: 700, fraud: 39 },
  { time: '16:00', safe: 650, fraud: 48 },
  { time: '20:00', safe: 500, fraud: 38 },
  { time: '24:00', safe: 420, fraud: 43 },
];

function App() {
  const [stats, setStats] = useState({
    total: 12530,
    fraud: 304,
    redFlags: 89,
    uptime: '99.9%'
  });

  const [transactions, setTransactions] = useState([
    { id: 'TX-9921', amount: 1250.00, risk: 92.5, status: 'fraud', time: 'Just now' },
    { id: 'TX-9920', amount: 45.00, risk: 12.1, status: 'safe', time: '2 min ago' },
    { id: 'TX-9919', amount: 8900.50, risk: 88.4, status: 'fraud', time: '5 min ago' },
    { id: 'TX-9918', amount: 12.99, risk: 2.3, status: 'safe', time: '12 min ago' },
    { id: 'TX-9917', amount: 340.00, risk: 18.2, status: 'safe', time: '15 min ago' },
  ]);

  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null); // 'uploading', 'success', 'error'
  const [uploadResults, setUploadResults] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Check backend connection
    fetch('http://127.0.0.1:8000/')
      .then(res => res.json())
      .then(data => setBackendStatus('Connected'))
      .catch(err => setBackendStatus('Disconnected'));

    // Simulate real-time data stream
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        total: prev.total + Math.floor(Math.random() * 5),
        fraud: prev.fraud + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file.');
      return;
    }

    setUploadStatus('uploading');
    setUploadResults(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadResults(data);
      setUploadStatus('success');

      // Update global stats based on upload
      setStats(prev => ({
        ...prev,
        total: prev.total + data.total_rows,
        fraud: prev.fraud + data.fraud_detected
      }));

    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
    }
  };

  return (
    <div className="dashboard-container">
      <header>
        <div>
          <h1>Fraud Detection AI</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={16} color={backendStatus === 'Connected' ? 'var(--success-color)' : 'var(--danger-color)'} />
            Backend Status: <span style={{ fontWeight: 600 }}>{backendStatus}</span>
          </p>
        </div>
        <button className="btn">
          <Activity size={18} /> Live Monitor
        </button>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Database size={24} /></div>
          <div className="stat-info">
            <p>Total Transactions</p>
            <h3>{stats.total.toLocaleString()}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><AlertTriangle size={24} /></div>
          <div className="stat-info">
            <p>Fraud Detected</p>
            <h3>{stats.fraud.toLocaleString()}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Shield size={24} /></div>
          <div className="stat-info">
            <p>System Uptime</p>
            <h3>{stats.uptime}</h3>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Transaction Volume & Anomalies</h2>
          </div>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFraud" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" />
                <YAxis stroke="rgba(255,255,255,0.2)" />
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="safe" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSafe)" />
                <Area type="monotone" dataKey="fraud" stroke="#ef4444" fillOpacity={1} fill="url(#colorFraud)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2 className="panel-title">Recent Flags</h2>
          </div>
          <div className="transaction-list">
            {transactions.map(tx => (
              <div className="transaction-item" key={tx.id}>
                <div className="tx-left">
                  {tx.status === 'fraud' ?
                    <AlertTriangle size={20} color="var(--danger-color)" /> :
                    <CheckCircle size={20} color="var(--success-color)" />
                  }
                  <div>
                    <div style={{ fontWeight: 600 }}>{tx.id}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      ${tx.amount.toFixed(2)} • {tx.time}
                    </div>
                  </div>
                </div>
                <div className={`badge ${tx.status}`}>
                  {tx.status === 'fraud' ? `${tx.risk}% Risk` : 'Safe'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <div className="panel-header">
          <h2 className="panel-title">Batch Analysis System</h2>
        </div>

        <div
          className={`upload-zone ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv"
            style={{ display: 'none' }}
          />
          <UploadCloud size={48} color={isDragging ? 'var(--accent-color)' : 'var(--text-secondary)'} style={{ marginBottom: '1rem' }} />
          <h3>Drag & Drop CSV File</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>or click to browse from your computer</p>
          {uploadStatus === 'uploading' && <p style={{ color: 'var(--accent-color)', marginTop: '1rem', fontWeight: 600 }}>Processing File through AI Models...</p>}
          {uploadStatus === 'error' && <p style={{ color: 'var(--danger-color)', marginTop: '1rem', fontWeight: 600 }}>Error processing file. Ensure it contains the correct columns.</p>}
        </div>

        {uploadResults && (
          <div className="upload-results slide-up">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem' }}>Analysis Results: <span style={{ color: 'var(--text-secondary)' }}>{uploadResults.filename}</span></h3>
                <p style={{ color: 'var(--text-secondary)' }}>Analyzed {uploadResults.total_rows} transactions.</p>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="badge safe">{uploadResults.safe_detected} Safe</div>
                <div className="badge fraud">{uploadResults.fraud_detected} Frauds</div>
              </div>
            </div>

            <div className="results-table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Row ID</th>
                    <th>Amount</th>
                    <th>Time</th>
                    <th>Risk Score</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadResults.transactions.slice(0, 10).map((tx, idx) => (
                    <tr key={idx} className={tx.is_fraud ? 'fraud-row' : ''}>
                      <td>#{tx.row_index}</td>
                      <td>${tx.amount.toFixed(2)}</td>
                      <td>{tx.time}</td>
                      <td>{tx.risk_score}%</td>
                      <td>
                        {tx.is_fraud ? (
                          <span className="badge fraud" style={{ padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>
                            {tx.red_flag ? 'ANOMALY' : 'FRAUD'}
                          </span>
                        ) : (
                          <span className="badge safe" style={{ padding: '0.15rem 0.5rem', fontSize: '0.65rem' }}>SAFE</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {uploadResults.total_rows > 10 && (
                <p style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Showing top 10 rows. {uploadResults.total_rows - 10} more hidden.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <footer>
        <p>Copyright © {new Date().getFullYear()} All Rights Reserved.</p>
        <p>Developed by <a href="https://www.linkedin.com/in/ahmadghazinazer" target="_blank" rel="noreferrer">Ahmad Al-Nazer</a></p>
      </footer>
    </div>
  );
}

export default App;
