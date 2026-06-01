// src/pages/MonitorPage.js

import React from 'react';
import { useBabyMonitor, fmt, SONGS } from '../context/BabyMonitorContext';

export default function MonitorPage() {
  const { state, startCrying, stopCrying, updateSetting, resetStats } = useBabyMonitor();
  const {
    status, crySeconds, babyName,
    parent1, parent2, alertThreshold,
    lullabyPlaying, alertSent,
    selectedSong,
    connected,
    totalEpisodes, totalAlerts, longestCry, totalSongs,
    activityLog
  } = state;

  const pct      = Math.min((crySeconds / alertThreshold) * 100, 100);
  const isCrying = status !== 'sleeping';

  const avatarEmoji =
    status === 'sleeping' ? '😴' :
    status === 'crying'   ? '😢' : '😭';

  const stateLabel =
    status === 'sleeping' ? 'Sleeping Peacefully' :
    status === 'crying'   ? `${babyName} is Crying` :
    `${babyName} — URGENT!`;

  const stateSub =
    status === 'sleeping' ? 'All is calm 🌙' :
    status === 'crying'   ? `🎵 Playing: ${selectedSong}` :
    'Parents have been notified! 📱';

  return (
    <div>

      {/* ── Page Heading ── */}
      <div className="page-heading">
        <h2>📡 Live Monitor</h2>
        <p>
          <span className={`conn-dot ${connected ? 'connected' : ''}`}></span>
          {connected ? 'Connected to server' : 'Disconnected — running in local mode'}
        </p>
      </div>

      {/* ── Lullaby bar ── */}
      {lullabyPlaying && (
        <div className="lullaby-bar">
          <div className="lullaby-note">🎵</div>
          <div style={{ flex: 1 }}>
            <div className="lullaby-name">{selectedSong}</div>
            <div className="lullaby-sub">Playing to soothe {babyName}…</div>
          </div>
          <div className="wave">
            <span/><span/><span/><span/><span/>
          </div>
        </div>
      )}

      {/* ── Alert banner ── */}
      {alertSent && (
        <div className="alert-banner">
          <div className="alert-title">🚨 Parent Alert Sent!</div>
          <div className="alert-body">
            {babyName} has been crying for over {Math.floor(alertThreshold / 60)} minutes.
          </div>
          <div className="alert-sms">
            📱 To: <strong>{parent1}</strong> &amp; <strong>{parent2}</strong><br/>
            💬 &quot;🚨 {babyName} has been crying for {Math.floor(alertThreshold / 60)}+ minutes.
            Please go and calm them down — they need you! 💕&quot;
          </div>
        </div>
      )}

      {/* ── Baby Status Card ── */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-title">👶 Baby Status</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>

          {/* Avatar */}
          <div className={`baby-avatar ${status}`}>{avatarEmoji}</div>

          {/* State info */}
          <div style={{ flex: 1, minWidth: '160px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text3)', marginBottom: '4px' }}>
              Current state
            </div>
            <div style={{
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: '26px', fontWeight: '800',
              color: status === 'sleeping' ? 'var(--blue)'
                   : status === 'crying'   ? 'var(--pink)'
                   : 'var(--red)',
              marginBottom: '4px'
            }}>
              {stateLabel}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text2)' }}>
              {stateSub}
            </div>
          </div>

          {/* Timer + progress */}
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>
              Crying duration
            </div>
            <div className={`timer-display ${crySeconds >= alertThreshold ? 'urgent' : ''}`}>
              {fmt(crySeconds)}
            </div>
            <div className="progress-track">
              <div
                className={`progress-fill ${crySeconds >= alertThreshold ? 'urgent' : ''}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text3)' }}>
              <span>0:00</span>
              <span>Alert at {fmt(alertThreshold)}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ── Controls + Song Selector ── */}
      <div className="grid-2">

        {/* Controls */}
        <div className="card">
          <div className="card-title">🎛️ Controls</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              className="btn btn-pink btn-full"
              onClick={startCrying}
              disabled={isCrying}
            >
              😢 Baby is Crying
            </button>
            <button
              className="btn btn-green btn-full"
              onClick={stopCrying}
              disabled={!isCrying}
            >
              😊 Baby Calmed Down
            </button>
            <button
              className="btn btn-ghost btn-full"
              onClick={resetStats}
            >
              🔄 Reset Stats
            </button>
          </div>
        </div>

        {/* Song selector */}
        <div className="card">
          <div className="card-title">🎶 Choose Lullaby</div>
          <div style={{ fontSize: '13px', color: 'var(--blue)', marginBottom: '10px', fontWeight: '600' }}>
            🎵 Now selected: {selectedSong}
          </div>
          <div className="song-grid">
            {SONGS.map(s => (
              <div
                key={s.id}
                className={`song-pill ${selectedSong === s.name ? 'song-selected' : ''}`}
                onClick={() => {
                  updateSetting('selectedSong',     s.name);
                  updateSetting('selectedSongFile', s.file);
                  // Switch song immediately if lullaby is playing
                  if (window._lullabyAudio) {
                    window._lullabyAudio.pause();
                    window._lullabyAudio.currentTime = 0;
                    const audio = new Audio(s.file);
                    audio.loop   = true;
                    audio.volume = 0.8;
                    audio.play().catch(e => console.warn(e));
                    window._lullabyAudio = audio;
                  }
                }}
              >
                {s.label}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text3)' }}>
            💡 Click any song to switch — even while playing!
          </div>
        </div>

      </div>

      {/* ── Stats Row ── */}
      <div className="grid-4">
        <div className="stat-card">
          <span className="stat-icon">😢</span>
          <span className="stat-num">{totalEpisodes}</span>
          <span className="stat-lbl">Episodes</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">📱</span>
          <span className="stat-num">{totalAlerts}</span>
          <span className="stat-lbl">Alerts Sent</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">⏱️</span>
          <span className="stat-num">{fmt(longestCry)}</span>
          <span className="stat-lbl">Longest Cry</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">🎵</span>
          <span className="stat-num">{totalSongs}</span>
          <span className="stat-lbl">Lullabies</span>
        </div>
      </div>

      {/* ── Activity Log ── */}
      <div className="card">
        <div className="card-title">📋 Activity Log</div>
        <div className="log-list">
          {activityLog.map((item, i) => (
            <div className="log-item" key={i}>
              <span className="log-time">{item.time}</span>
              <span className="log-emoji">{item.emoji}</span>
              <span className="log-msg">{item.msg}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}