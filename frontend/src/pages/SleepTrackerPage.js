// src/pages/SleepTrackerPage.js

import React, { useState, useEffect } from 'react';

const SLEEP_KEY = 'cryguary_sleep_data';

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(SLEEP_KEY)) || [];
  } catch { return []; }
}

function saveData(data) {
  localStorage.setItem(SLEEP_KEY, JSON.stringify(data));
}

function fmt12(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}

function diffHours(start, end) {
  if (!start || !end) return 0;
  return Math.max(0, (new Date(end) - new Date(start)) / 3600000);
}

function fmtDuration(hours) {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function getQuality(hours) {
  if (hours >= 10) return { label: 'Excellent 😴', color: '#06d6a0' };
  if (hours >= 7)  return { label: 'Good 🙂',      color: '#5eb3ff' };
  if (hours >= 4)  return { label: 'Fair 😐',       color: '#ffd166' };
  return               { label: 'Poor 😟',          color: '#ff4d6d' };
}

export default function SleepTrackerPage() {
  const [records, setRecords]     = useState(loadData);
  const [isSleeping, setIsSleeping] = useState(false);
  const [sleepStart, setSleepStart] = useState(null);
  const [elapsed, setElapsed]     = useState(0);
  const [babyName, setBabyName]   = useState('Little One');
  const [note, setNote]           = useState('');
  const [activeTab, setActiveTab] = useState('tracker'); // tracker | history | stats

  // Live elapsed timer
  useEffect(() => {
    if (!isSleeping) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - new Date(sleepStart)) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [isSleeping, sleepStart]);

  const fmtElapsed = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  // Start sleep
  const startSleep = () => {
    const now = new Date().toISOString();
    setIsSleeping(true);
    setSleepStart(now);
    setElapsed(0);
  };

  // End sleep
  const endSleep = () => {
    const now = new Date().toISOString();
    const hours = diffHours(sleepStart, now);
    const newRecord = {
      id: Date.now(),
      babyName,
      date: fmtDate(sleepStart),
      sleepStart,
      sleepEnd: now,
      durationHours: hours,
      note
    };
    const updated = [newRecord, ...records];
    setRecords(updated);
    saveData(updated);
    setIsSleeping(false);
    setSleepStart(null);
    setElapsed(0);
    setNote('');
  };

  const deleteRecord = (id) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    saveData(updated);
  };

  // Stats
  const totalSleeps   = records.length;
  const totalHours    = records.reduce((s, r) => s + r.durationHours, 0);
  const avgHours      = totalSleeps ? totalHours / totalSleeps : 0;
  const longestSleep  = records.reduce((max, r) => Math.max(max, r.durationHours), 0);
  const todayRecords  = records.filter(r => r.date === fmtDate(new Date().toISOString()));
  const todayHours    = todayRecords.reduce((s, r) => s + r.durationHours, 0);

  // Last 7 days chart data
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString([], { weekday: 'short' });
    const dateStr = fmtDate(d.toISOString());
    const hrs = records
      .filter(r => r.date === dateStr)
      .reduce((s, r) => s + r.durationHours, 0);
    last7.push({ label, hrs });
  }
  const maxBar = Math.max(...last7.map(d => d.hrs), 1);

  return (
    <div>
      {/* Page heading */}
      <div className="page-heading">
        <h2>🌙 Sleep Tracker</h2>
        <p>Track your baby's sleep patterns and hours</p>
      </div>

      {/* Sub tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { id: 'tracker', label: '⏱️ Tracker'  },
          { id: 'history', label: '📋 History'  },
          { id: 'stats',   label: '📊 Stats'    },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '0.45rem 1.2rem',
              borderRadius: '99px',
              border: '1px solid',
              borderColor: activeTab === t.id ? 'var(--pink)' : 'var(--border)',
              background: activeTab === t.id ? 'var(--pink)' : 'var(--card)',
              color: activeTab === t.id ? '#fff' : 'var(--text2)',
              fontFamily: "'Nunito', sans-serif",
              fontSize: '14px', fontWeight: '600',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ TRACKER TAB ══ */}
      {activeTab === 'tracker' && (
        <div>
          {/* Baby name input */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div className="card-title">👶 Baby Info</div>
            <div className="field-group" style={{ marginBottom: 0 }}>
              <label className="field-label">Baby's Name</label>
              <input
                className="field-input"
                value={babyName}
                onChange={e => setBabyName(e.target.value)}
                placeholder="Little One"
                disabled={isSleeping}
              />
            </div>
          </div>

          {/* Main sleep card */}
          <div className="card" style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
            <div className="card-title" style={{ justifyContent: 'center' }}>
              {isSleeping ? '😴 Baby is Sleeping...' : '⏱️ Sleep Timer'}
            </div>

            {/* Big clock */}
            <div style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: '64px', fontWeight: '800',
              color: isSleeping ? 'var(--blue)' : 'var(--text3)',
              letterSpacing: '-3px',
              lineHeight: 1,
              margin: '1rem 0',
              transition: 'color 0.3s'
            }}>
              {fmtElapsed(elapsed)}
            </div>

            {/* Sleep start time */}
            {isSleeping && (
              <div style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '1rem' }}>
                😴 Fell asleep at <strong>{fmt12(sleepStart)}</strong>
              </div>
            )}

            {/* Moon animation when sleeping */}
            {isSleeping && (
              <div style={{ fontSize: '48px', marginBottom: '1rem', animation: 'moon-float 3s ease-in-out infinite' }}>
                🌙
              </div>
            )}

            {/* Note input */}
            {!isSleeping && (
              <div style={{ marginBottom: '1rem', textAlign: 'left' }}>
                <label className="field-label">Note (optional)</label>
                <input
                  className="field-input"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. nap after feeding..."
                />
              </div>
            )}

            {/* Buttons */}
            {!isSleeping ? (
              <button className="btn btn-pink btn-full" onClick={startSleep}>
                🌙 Baby Fell Asleep
              </button>
            ) : (
              <button className="btn btn-full" onClick={endSleep} style={{
                background: 'var(--yellow)', borderColor: 'var(--yellow)',
                color: 'var(--navy)', fontWeight: '700'
              }}>
                ☀️ Baby Woke Up
              </button>
            )}
          </div>

          {/* Today summary */}
          <div className="card">
            <div className="card-title">📅 Today's Sleep</div>
            {todayRecords.length === 0 ? (
              <p style={{ fontSize: '14px', color: 'var(--text3)', textAlign: 'center', padding: '1rem 0' }}>
                No sleep recorded today yet.
              </p>
            ) : (
              <>
                <div style={{
                  display: 'flex', justifyContent: 'center', alignItems: 'center',
                  gap: '1rem', marginBottom: '1rem'
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Baloo 2',sans-serif", fontSize: '36px', fontWeight: '800', color: 'var(--blue)' }}>
                      {fmtDuration(todayHours)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Total today</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Baloo 2',sans-serif", fontSize: '36px', fontWeight: '800', color: getQuality(todayHours).color }}>
                      {getQuality(todayHours).label}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Sleep quality</div>
                  </div>
                </div>
                {todayRecords.map(r => (
                  <div key={r.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 0', borderBottom: '1px solid var(--border)',
                    fontSize: '13px', color: 'var(--text)'
                  }}>
                    <span>🌙 {fmt12(r.sleepStart)} → ☀️ {fmt12(r.sleepEnd)}</span>
                    <span style={{ color: 'var(--blue)', fontWeight: '700' }}>{fmtDuration(r.durationHours)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* ══ HISTORY TAB ══ */}
      {activeTab === 'history' && (
        <div className="card">
          <div className="card-title">📋 All Sleep Records</div>
          {records.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--text3)', textAlign: 'center', padding: '1.5rem 0' }}>
              No sleep records yet. Start tracking! 🌙
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Baby</th>
                    <th>Date</th>
                    <th>Slept At</th>
                    <th>Woke At</th>
                    <th>Duration</th>
                    <th>Quality</th>
                    <th>Note</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => {
                    const q = getQuality(r.durationHours);
                    return (
                      <tr key={r.id}>
                        <td>{r.babyName}</td>
                        <td>{r.date}</td>
                        <td>{fmt12(r.sleepStart)}</td>
                        <td>{fmt12(r.sleepEnd)}</td>
                        <td style={{ color: 'var(--blue)', fontWeight: '700' }}>{fmtDuration(r.durationHours)}</td>
                        <td><span className="badge" style={{ background: q.color + '33', color: q.color }}>{q.label}</span></td>
                        <td style={{ fontSize: '12px', color: 'var(--text3)' }}>{r.note || '—'}</td>
                        <td>
                          <button
                            onClick={() => deleteRecord(r.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: '16px' }}
                          >🗑️</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ══ STATS TAB ══ */}
      {activeTab === 'stats' && (
        <div>
          {/* Stat cards */}
          <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
            <div className="stat-card">
              <span className="stat-icon">😴</span>
              <span className="stat-num">{totalSleeps}</span>
              <span className="stat-lbl">Total Sleeps</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">⏱️</span>
              <span className="stat-num">{fmtDuration(avgHours)}</span>
              <span className="stat-lbl">Avg Per Sleep</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">🏆</span>
              <span className="stat-num">{fmtDuration(longestSleep)}</span>
              <span className="stat-lbl">Longest Sleep</span>
            </div>
            <div className="stat-card">
              <span className="stat-icon">📅</span>
              <span className="stat-num">{fmtDuration(todayHours)}</span>
              <span className="stat-lbl">Today Total</span>
            </div>
          </div>

          {/* Bar chart — last 7 days */}
          <div className="card">
            <div className="card-title">📊 Last 7 Days Sleep Hours</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '160px', padding: '0 8px' }}>
              {last7.map((d, i) => {
                const pct = (d.hrs / maxBar) * 100;
                const q = getQuality(d.hrs);
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '11px', color: q.color, fontWeight: '700' }}>
                      {d.hrs > 0 ? fmtDuration(d.hrs) : ''}
                    </div>
                    <div style={{
                      width: '100%', borderRadius: '6px 6px 0 0',
                      background: d.hrs > 0 ? q.color : 'rgba(255,255,255,0.05)',
                      height: `${Math.max(pct, d.hrs > 0 ? 8 : 4)}%`,
                      transition: 'height 0.5s ease',
                      minHeight: '4px'
                    }} />
                    <div style={{ fontSize: '11px', color: 'var(--text3)', textAlign: 'center' }}>{d.label}</div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
              {[
                { label: 'Excellent (10h+)', color: '#06d6a0' },
                { label: 'Good (7-10h)',     color: '#5eb3ff' },
                { label: 'Fair (4-7h)',      color: '#ffd166' },
                { label: 'Poor (<4h)',       color: '#ff4d6d' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text2)' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Recommended sleep hours */}
          <div className="card" style={{ marginTop: '1.25rem' }}>
            <div className="card-title">💡 Recommended Sleep Hours</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { age: 'Newborn (0–3 months)',  hours: '14–17 hours', icon: '👶' },
                { age: 'Infant (4–11 months)',  hours: '12–15 hours', icon: '🍼' },
                { age: 'Toddler (1–2 years)',   hours: '11–14 hours', icon: '🧒' },
                { age: 'Preschool (3–5 years)', hours: '10–13 hours', icon: '🧒' },
              ].map((r, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '10px', borderRadius: 'var(--radius-sm)',
                  background: 'rgba(255,255,255,0.04)',
                  fontSize: '14px'
                }}>
                  <span style={{ fontSize: '22px' }}>{r.icon}</span>
                  <span style={{ flex: 1, color: 'var(--text2)' }}>{r.age}</span>
                  <span style={{ fontWeight: '700', color: 'var(--blue)' }}>{r.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}