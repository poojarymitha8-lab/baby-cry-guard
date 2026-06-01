// src/App.js

import React, { useState, useEffect } from 'react';
import { BabyMonitorProvider } from './context/BabyMonitorContext';
import MonitorPage      from './pages/MonitorPage';
import SettingsPage     from './pages/SettingsPage';
import HistoryPage      from './pages/HistoryPage';
import SleepTrackerPage from './pages/SleepTrackerPage';
import './App.css';

// ── Desktop Only Block ───────────────────────────────────────
function DesktopOnlyBlock() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f1b35',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      textAlign: 'center',
      padding: '2rem',
      fontFamily: "'Nunito', sans-serif"
    }}>
      {/* Stars background */}
      <div style={{
        position: 'fixed', inset: 0,
        backgroundImage: `
          radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.5) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 30% 60%, rgba(94,179,255,0.4) 0%, transparent 100%),
          radial-gradient(1px 1px at 55% 10%, rgba(255,126,179,0.5) 0%, transparent 100%),
          radial-gradient(1px 1px at 75% 80%, rgba(255,255,255,0.3) 0%, transparent 100%),
          radial-gradient(1.5px 1.5px at 88% 35%, rgba(255,209,102,0.4) 0%, transparent 100%)
        `,
        pointerEvents: 'none'
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Icon */}
        <div style={{ fontSize: '80px', marginBottom: '1rem', animation: 'moon-float 3s ease-in-out infinite' }}>
          🖥️
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: "'Baloo 2', sans-serif",
          fontSize: '28px', fontWeight: '800',
          color: '#ffffff', marginBottom: '0.75rem',
          letterSpacing: '-0.5px'
        }}>
          Desktop Only 🌙
        </h1>

        {/* Message */}
        <p style={{
          fontSize: '16px', color: '#a89fc0',
          maxWidth: '320px', lineHeight: '1.6',
          marginBottom: '2rem'
        }}>
          <strong style={{ color: '#ff7eb3' }}>Cryguary Baby Monitor</strong> is designed
          for PC and laptop screens only. Please open this app on your computer.
        </p>

        {/* Info box */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: '16px',
          padding: '1.25rem 1.5rem',
          maxWidth: '320px',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '13px', color: '#6e6484', marginBottom: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
            How to open on PC
          </div>
          {[
            { icon: '1️⃣', text: 'Open your PC or laptop' },
            { icon: '2️⃣', text: 'Open Chrome or any browser' },
            { icon: '3️⃣', text: 'Go to: localhost:3000' },
          ].map((step, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '8px 0',
              borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              fontSize: '14px', color: '#f0eaff'
            }}>
              <span style={{ fontSize: '18px' }}>{step.icon}</span>
              <span>{step.text}</span>
            </div>
          ))}
        </div>

        {/* Baby emoji */}
        <div style={{ fontSize: '32px' }}>👶💤</div>
        <p style={{ fontSize: '12px', color: '#6e6484', marginTop: '8px' }}>
          Baby is sleeping peacefully...
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab]           = useState('monitor');
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and on resize
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 900);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Show block screen on mobile
  if (isMobile) return <DesktopOnlyBlock />;

  return (
    <BabyMonitorProvider>
      <div className="app-shell">
        {/* Top nav */}
        <header className="app-nav">
          <div className="nav-brand">
            <span className="nav-moon">🌙</span>
            <span className="nav-title">Cryguary</span>
            <span className="nav-sub">Baby Monitor</span>
          </div>
          <nav className="nav-tabs">
            {[
              { id: 'monitor',  label: '📡 Monitor'  },
              { id: 'sleep',    label: '🌙 Sleep'     },
              { id: 'settings', label: '⚙️ Settings'  },
              { id: 'history',  label: '📋 History'   }
            ].map(t => (
              <button
                key={t.id}
                className={`nav-tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </header>

        {/* Pages */}
        <main className="app-main">
          {tab === 'monitor'  && <MonitorPage      />}
          {tab === 'sleep'    && <SleepTrackerPage />}
          {tab === 'settings' && <SettingsPage     />}
          {tab === 'history'  && <HistoryPage      />}
        </main>
      </div>
    </BabyMonitorProvider>
  );
}