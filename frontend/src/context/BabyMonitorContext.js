// src/context/BabyMonitorContext.js

import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const BabyMonitorContext = createContext();

// ── All 6 songs with their MP3 files ─────────────────────────
export const SONGS = [
  { id: 'twinkle',   label: '⭐ Twinkle Twinkle',     name: 'Twinkle Twinkle Little Star', file: '/lullaby1.mp3' },
  { id: 'rockaby',   label: '🌊 Rock-a-Bye Baby',     name: 'Rock-a-Bye Baby',             file: '/lullaby2.mp3' },
  { id: 'hush',      label: '🤫 Hush Little Baby',    name: 'Hush Little Baby',            file: '/lullaby3.mp3' },
  { id: 'brahms',    label: '🎼 Brahms Lullaby',      name: 'Brahms Lullaby',              file: '/lullaby4.mp3' },
  { id: 'sunshine',  label: '☀️ You Are My Sunshine', name: 'You Are My Sunshine',         file: '/lullaby5.mp3' },
  { id: 'sleepbaby', label: '💤 Sleep Little Baby',   name: 'Sleep Little Baby',           file: '/lullaby6.mp3' },
];

// ── Initial state ─────────────────────────────────────────────
const initialState = {
  status: 'sleeping',
  crySeconds: 0,
  sessionId: null,
  babyName: 'Little One',
  parent1: 'Mum',
  parent2: 'Dad',
  alertThreshold: 300,
  selectedSong: 'Twinkle Twinkle Little Star',
  selectedSongFile: '/lullaby1.mp3',       // ← tracks which MP3 to play
  lullabyPlaying: false,
  alertSent: false,
  connected: false,
  totalEpisodes: 0,
  totalAlerts: 0,
  longestCry: 0,
  totalSongs: 0,
  activityLog: [
    { time: new Date().toLocaleTimeString(), emoji: '🌙', msg: 'Baby monitor started. All is calm.' }
  ],
  sessions: [],
  alerts: []
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STATUS':       return { ...state, status: action.payload };
    case 'SET_CRY_SECONDS':  return { ...state, crySeconds: action.payload };
    case 'SET_SESSION_ID':   return { ...state, sessionId: action.payload };
    case 'SET_LULLABY':      return { ...state, lullabyPlaying: action.payload };
    case 'SET_ALERT_SENT':   return { ...state, alertSent: action.payload };
    case 'SET_CONNECTED':    return { ...state, connected: action.payload };
    case 'UPDATE_SETTING':   return { ...state, [action.key]: action.value };
    case 'INC_EPISODES':     return { ...state, totalEpisodes: state.totalEpisodes + 1 };
    case 'INC_ALERTS':       return { ...state, totalAlerts: state.totalAlerts + 1 };
    case 'INC_SONGS':        return { ...state, totalSongs: state.totalSongs + 1 };
    case 'UPDATE_LONGEST':   return { ...state, longestCry: Math.max(state.longestCry, action.payload) };
    case 'ADD_LOG':
      return {
        ...state,
        activityLog: [
          { time: new Date().toLocaleTimeString(), emoji: action.emoji, msg: action.msg },
          ...state.activityLog
        ].slice(0, 30)
      };
    case 'SET_SESSIONS':  return { ...state, sessions: action.payload };
    case 'SET_ALERTS':    return { ...state, alerts: action.payload };
    case 'RESET_STATS':
      return {
        ...state,
        totalEpisodes: 0, totalAlerts: 0, longestCry: 0, totalSongs: 0,
        activityLog: [{ time: new Date().toLocaleTimeString(), emoji: '🔄', msg: 'Stats reset.' }]
      };
    default: return state;
  }
}

// ── Provider ──────────────────────────────────────────────────
export function BabyMonitorProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timerRef   = useRef(null);
  const socketRef  = useRef(null);
  const crySecsRef = useRef(0);
  const stateRef   = useRef(state);

  // Keep stateRef in sync so callbacks always get latest state
  useEffect(() => { stateRef.current = state; }, [state]);

  // ── Socket.io ─────────────────────────────────────────────
  useEffect(() => {
    const socket = io('http://localhost:5000');
    socketRef.current = socket;
    socket.on('connect',    () => dispatch({ type: 'SET_CONNECTED', payload: true }));
    socket.on('disconnect', () => dispatch({ type: 'SET_CONNECTED', payload: false }));
    socket.on('alert:new',  ({ message }) => dispatch({ type: 'ADD_LOG', emoji: '📱', msg: `Server: ${message}` }));
    socket.on('parent:ack', ({ acknowledgedBy }) => dispatch({ type: 'ADD_LOG', emoji: '✅', msg: `${acknowledgedBy} acknowledged!` }));
    return () => socket.disconnect();
  }, []);

  // ── Play MP3 lullaby ──────────────────────────────────────
  const playAudio = useCallback((songFile) => {
    // Stop any existing audio first
    if (window._lullabyAudio) {
      window._lullabyAudio.pause();
      window._lullabyAudio.currentTime = 0;
      window._lullabyAudio = null;
    }
    const audio = new Audio(songFile);
    audio.loop   = true;
    audio.volume = 0.8;
    audio.play().catch(e => console.warn('Audio play error:', e));
    window._lullabyAudio = audio;
  }, []);

  // ── Stop audio ────────────────────────────────────────────
  const stopAudio = useCallback(() => {
    if (window._lullabyAudio) {
      window._lullabyAudio.pause();
      window._lullabyAudio.currentTime = 0;
      window._lullabyAudio = null;
    }
  }, []);

  // ── Start crying ──────────────────────────────────────────
  const startCrying = useCallback(async () => {
    const s = stateRef.current;
    if (s.status !== 'sleeping') return;

    crySecsRef.current = 0;
    dispatch({ type: 'SET_CRY_SECONDS', payload: 0 });
    dispatch({ type: 'SET_STATUS',      payload: 'crying' });
    dispatch({ type: 'SET_ALERT_SENT',  payload: false });
    dispatch({ type: 'INC_EPISODES' });
    dispatch({ type: 'INC_SONGS' });
    dispatch({ type: 'SET_LULLABY',     payload: true });
    dispatch({ type: 'ADD_LOG', emoji: '😢', msg: `${s.babyName} started crying! Playing "${s.selectedSong}"…` });

    // ── Play the selected song ──
    playAudio(s.selectedSongFile || '/lullaby1.mp3');

    // Socket
    socketRef.current?.emit('baby:crying', { babyName: s.babyName, song: s.selectedSong, time: new Date() });

    // Save session to DB
    let sessionId = null;
    try {
      const res = await axios.post('/api/sessions', {
        babyName: s.babyName,
        lullabyPlayed: s.selectedSong
      });
      sessionId = res.data.session._id;
      dispatch({ type: 'SET_SESSION_ID', payload: sessionId });
    } catch (e) {
      console.warn('DB session error:', e.message);
    }

    // Timer
    timerRef.current = setInterval(() => {
      crySecsRef.current += 1;
      dispatch({ type: 'SET_CRY_SECONDS', payload: crySecsRef.current });
      dispatch({ type: 'UPDATE_LONGEST',  payload: crySecsRef.current });

      if (crySecsRef.current >= stateRef.current.alertThreshold) {
        clearInterval(timerRef.current);
        timerRef.current = null;
        triggerAlert(sessionId, crySecsRef.current);
      }
    }, 1000);
  }, [playAudio]);

  // ── Trigger parent alert ──────────────────────────────────
  const triggerAlert = useCallback(async (sessionId, dur) => {
    const s = stateRef.current;
    dispatch({ type: 'SET_STATUS',     payload: 'alert' });
    dispatch({ type: 'SET_ALERT_SENT', payload: true });
    dispatch({ type: 'INC_ALERTS' });
    dispatch({ type: 'ADD_LOG', emoji: '🚨', msg: `ALERT! ${s.babyName} crying ${Math.floor(dur / 60)}+ min — parents notified!` });

    try {
      await axios.post('/api/alerts', {
        sessionId,
        babyName: s.babyName,
        parents: [{ name: s.parent1 }, { name: s.parent2 }],
        cryDurationSeconds: dur
      });
    } catch (e) {
      console.warn('DB alert error:', e.message);
    }
  }, []);

  // ── Stop crying ───────────────────────────────────────────
  const stopCrying = useCallback(async () => {
    const s = stateRef.current;
    if (s.status === 'sleeping') return;

    clearInterval(timerRef.current);
    timerRef.current = null;
    const dur = crySecsRef.current;

    stopAudio();

    dispatch({ type: 'ADD_LOG',         emoji: '😊', msg: `${s.babyName} calmed down after ${fmt(dur)}.` });
    dispatch({ type: 'SET_STATUS',      payload: 'sleeping' });
    dispatch({ type: 'SET_LULLABY',     payload: false });
    dispatch({ type: 'SET_ALERT_SENT',  payload: false });
    dispatch({ type: 'SET_CRY_SECONDS', payload: 0 });

    socketRef.current?.emit('baby:calm', { babyName: s.babyName, durationSeconds: dur });

    if (s.sessionId) {
      try {
        await axios.patch(`/api/sessions/${s.sessionId}/end`, { durationSeconds: dur });
      } catch (e) {
        console.warn('DB end session error:', e.message);
      }
    }
    crySecsRef.current = 0;
    dispatch({ type: 'SET_SESSION_ID', payload: null });
  }, [stopAudio]);

  // ── Fetch history ─────────────────────────────────────────
  const fetchHistory = useCallback(async () => {
    try {
      const [sessRes, alertRes] = await Promise.all([
        axios.get('/api/sessions'),
        axios.get('/api/alerts')
      ]);
      dispatch({ type: 'SET_SESSIONS', payload: sessRes.data.sessions });
      dispatch({ type: 'SET_ALERTS',   payload: alertRes.data.alerts });
    } catch (e) {
      console.warn('Fetch history error:', e.message);
    }
  }, []);

  const updateSetting = (key, value) => dispatch({ type: 'UPDATE_SETTING', key, value });
  const resetStats    = ()            => dispatch({ type: 'RESET_STATS' });
  const addLog        = (emoji, msg)  => dispatch({ type: 'ADD_LOG', emoji, msg });

  return (
    <BabyMonitorContext.Provider value={{
      state, startCrying, stopCrying, updateSetting, resetStats, addLog, fetchHistory
    }}>
      {children}
    </BabyMonitorContext.Provider>
  );
}

export function useBabyMonitor() {
  return useContext(BabyMonitorContext);
}

export function fmt(s) {
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}