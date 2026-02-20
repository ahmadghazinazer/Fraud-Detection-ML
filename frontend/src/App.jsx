import React, { useState, useEffect, useRef } from 'react';
import { Shield, AlertTriangle, Activity, Database, Server, CheckCircle, UploadCloud, Download, Cpu, Info, FileSpreadsheet } from 'lucide-react';
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

  const exportToCSV = () => {
    if (!uploadResults || !uploadResults.transactions) return;

    // Create CSV headers
    const headers = ['Row ID', 'Amount', 'Time', 'Risk Score', 'Flagged By', 'Status'];

    // Map data to CSV rows
    const rows = uploadResults.transactions.map(tx => [
      tx.row_index,
      tx.amount.toFixed(2),
      tx.time,
      `${tx.risk_score}%`,
      `"${tx.flagged_by}"`, // wrap in quotes in case of commas
      tx.is_fraud ? (tx.red_flag ? 'ANOMALY' : 'FRAUD') : 'SAFE'
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Fraud_Analysis_Results_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

      {/* AI Model Architecture Visual */}
      <div className="panel" style={{ marginTop: '1.5rem', background: 'linear-gradient(145deg, rgba(20,26,38,0.9) 0%, rgba(30,41,59,0.9) 100%)', border: '1px solid var(--accent-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(59,130,246,0.2)', padding: '12px', borderRadius: '12px' }}>
            <Cpu size={24} color="var(--accent-color)" />
          </div>
          <div>
            <h2 className="panel-title" style={{ margin: 0, color: 'var(--accent-color)' }}>Dual-Engine Machine Learning Core</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '4px' }}>Real-time active Scikit-Learn models analyzing your transactions simultaneously.</p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Random Forest Classifier</h3>
              <span className="badge safe" style={{ animation: 'pulse-green 2s infinite' }}>ACTIVE</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>Supervised learning model trained on historical fraud patterns to predict highly-correlated risk scores.</p>
            <div style={{ background: 'rgba(0,0,0,0.2)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '92%', height: '100%', background: 'var(--accent-color)', borderRadius: '3px' }}></div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'right' }}>Model Accuracy: 92.4%</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Isolation Forest</h3>
              <span className="badge safe" style={{ animation: 'pulse-green 2s infinite', animationDelay: '1s' }}>ACTIVE</span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>Unsupervised anomaly detection identifying zero-day fraud and extreme deviations from normal behavior.</p>
            <div style={{ background: 'rgba(0,0,0,0.2)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: '95%', height: '100%', background: 'var(--success-color)', borderRadius: '3px' }}></div>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem', textAlign: 'right' }}>Anomaly Contour Density: 5%</p>
          </div>
        </div>
      </div>

      <div className="panel" style={{ marginTop: '1.5rem' }}>
        <div className="panel-header" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '0' }}>
          <h2 className="panel-title">Batch Analysis System</h2>
        </div>

        <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <Info size={20} color="var(--accent-color)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}><FileSpreadsheet size={16} /> Data Validation Requirements</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Your file must be a valid `.csv` format. <strong>Required columns:</strong> <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', color: '#e2e8f0', margin: '0 4px' }}>amount</code> <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', color: '#e2e8f0', margin: '0 4px' }}>time</code> <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', color: '#e2e8f0', margin: '0 4px' }}>v1</code> <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', color: '#e2e8f0', margin: '0 4px' }}>v2</code> <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', color: '#e2e8f0', margin: '0 4px' }}>v3</code>. The Dual ML engines require all 5 feature vectors to accurately predict risk scores.</p>
          </div>
        </div>

        <div style={{ padding: '2rem' }}>
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
            {uploadStatus === 'uploading' && <p style={{ color: 'var(--accent-color)', marginTop: '1rem', fontWeight: 600 }}>Analyzing via Dual-Engine ML Pipeline...</p>}
            {uploadStatus === 'error' && <p style={{ color: 'var(--danger-color)', marginTop: '1rem', fontWeight: 600 }}>Validation Error: File must match the required schema.</p>}
          </div>
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
                <div className="badge fraud" style={{ animation: 'none' }}>{uploadResults.fraud_detected} Frauds/Anomalies</div>
                <button onClick={exportToCSV} className="btn" style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', color: '#fff' }}>
                  <Download size={16} /> Export to CSV
                </button>
              </div>
            </div>

            <div className="results-table-container">
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Row ID</th>
                    <th>Amount</th>
                    <th>Time</th>
                    <th>ML Risk Score</th>
                    <th>Model Trigger</th>
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
                        <span style={{ fontSize: '0.75rem', color: tx.is_fraud ? '#fca5a5' : 'var(--text-secondary)' }}>
                          {tx.flagged_by}
                        </span>
                      </td>
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
