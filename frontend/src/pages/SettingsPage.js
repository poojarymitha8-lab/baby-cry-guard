// src/pages/SettingsPage.js

import React from 'react';
import { useBabyMonitor } from '../context/BabyMonitorContext';

export default function SettingsPage() {
  const { state, updateSetting } = useBabyMonitor();
  const { babyName, parent1, parent2, alertThreshold } = state;

  return (
    <div>
      <div className="page-heading">
        <h2>⚙️ Settings</h2>
        <p>Configure parents, baby info, and alert preferences</p>
      </div>

      {/* Baby info card */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-title">👶 Baby Information</div>
        <div className="field-group">
          <label className="field-label">Baby's Name</label>
          <input
            className="field-input"
            value={babyName}
            onChange={e => updateSetting('babyName', e.target.value)}
            placeholder="Little One"
          />
        </div>
      </div>

      {/* Parents card */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-title">👨‍👩‍👧 Parent Names</div>
        <div className="field-row">
          <div className="field-group">
            <label className="field-label">Parent 1</label>
            <input
              className="field-input"
              value={parent1}
              onChange={e => updateSetting('parent1', e.target.value)}
              placeholder="Mum"
            />
          </div>
          <div className="field-group">
            <label className="field-label">Parent 2</label>
            <input
              className="field-input"
              value={parent2}
              onChange={e => updateSetting('parent2', e.target.value)}
              placeholder="Dad"
            />
          </div>
        </div>
      </div>

      {/* Alert threshold card */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div className="card-title">⏰ Alert Threshold</div>
        <p style={{ fontSize: '13px', color: 'var(--text2)', marginBottom: '1rem' }}>
          Send parent alert if baby cries longer than this many minutes.
        </p>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '1rem',
          background: 'rgba(255,209,102,0.10)',
          border: '1px solid rgba(255,209,102,0.3)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem'
        }}>
          <span style={{ fontSize: '22px' }}>⏰</span>
          <span style={{ flex: 1, fontSize: '14px', fontWeight: '600', color: 'var(--yellow)' }}>
            Alert after (minutes)
          </span>
          <input
            type="number" min="1" max="30"
            style={{
              width: '75px', padding: '0.4rem 0.6rem',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,209,102,0.4)',
              borderRadius: 'var(--radius-xs)',
              fontFamily: "'Baloo 2', sans-serif",
              fontSize: '20px', fontWeight: '700',
              color: 'var(--yellow)', textAlign: 'center', outline: 'none'
            }}
            value={alertThreshold / 60}
            onChange={e => updateSetting('alertThreshold', parseInt(e.target.value || 5) * 60)}
          />
        </div>
      </div>

      {/* Info card */}
      <div className="card">
        <div className="card-title">ℹ️ How It Works</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { icon: '😢', title: 'Baby Starts Crying', desc: 'Press "Baby is Crying" to start a session. Timer begins immediately.' },
            { icon: '🎵', title: 'Lullaby Plays', desc: 'A soothing lullaby plays instantly to try to calm the baby.' },
            { icon: '📱', title: 'Parent Alert', desc: `If crying continues past ${alertThreshold / 60} minutes, parents get an alert to go comfort baby.` },
            { icon: '💾', title: 'Data Saved', desc: 'Every session is saved to MongoDB via the backend API for history & stats.' },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '24px', flexShrink: 0, marginTop: '2px' }}>{step.icon}</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text)', marginBottom: '2px' }}>{step.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: '1.5' }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}