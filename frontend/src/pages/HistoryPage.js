// src/pages/HistoryPage.js

import React, { useEffect } from 'react';
import { useBabyMonitor, fmt } from '../context/BabyMonitorContext';

export default function HistoryPage() {
  const { state, fetchHistory } = useBabyMonitor();
  const { sessions, alerts } = state;

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  return (
    <div>
      <div className="page-heading">
        <h2>📋 History</h2>
        <p>All cry sessions and alerts saved in MongoDB</p>
      </div>

      {/* Refresh button */}
      <div style={{ marginBottom: '1.25rem' }}>
        <button className="btn btn-ghost" onClick={fetchHistory}>
          🔄 Refresh from Database
        </button>
      </div>

      {/* Sessions table */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-title">😢 Cry Sessions</div>
        {sessions.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--text3)', textAlign: 'center', padding: '1.5rem 0' }}>
            No sessions yet. Start monitoring to record data.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Baby</th>
                  <th>Started</th>
                  <th>Duration</th>
                  <th>Alert Sent</th>
                  <th>Lullaby</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(s => (
                  <tr key={s._id}>
                    <td>{s.babyName || '—'}</td>
                    <td>{new Date(s.startTime).toLocaleString()}</td>
                    <td>{s.durationSeconds ? fmt(s.durationSeconds) : '—'}</td>
                    <td>
                      <span className={`badge ${s.alertSent ? 'badge-red' : 'badge-green'}`}>
                        {s.alertSent ? '🚨 Yes' : '✅ No'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px' }}>{s.lullabyPlayed || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Alerts table */}
      <div className="card">
        <div className="card-title">📱 Parent Alerts</div>
        {alerts.length === 0 ? (
          <p style={{ fontSize: '14px', color: 'var(--text3)', textAlign: 'center', padding: '1.5rem 0' }}>
            No alerts sent yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table">
              <thead>
                <tr>
                  <th>Baby</th>
                  <th>Sent At</th>
                  <th>Cry Duration</th>
                  <th>Message</th>
                  <th>Acknowledged</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map(a => (
                  <tr key={a._id}>
                    <td>{a.babyName || '—'}</td>
                    <td>{new Date(a.createdAt).toLocaleString()}</td>
                    <td>{fmt(a.cryDurationSeconds)}</td>
                    <td style={{ fontSize: '12px', maxWidth: '200px' }}>{a.message}</td>
                    <td>
                      <span className={`badge ${a.acknowledged ? 'badge-green' : 'badge-red'}`}>
                        {a.acknowledged ? `✅ ${a.acknowledgedBy}` : '⏳ Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}