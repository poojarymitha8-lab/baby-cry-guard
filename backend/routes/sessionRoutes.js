// routes/sessionRoutes.js

const express    = require('express');
const router     = express.Router();
const CrySession = require('../models/CrySession');

// ── POST /api/sessions  — start a new cry session ──
router.post('/', async (req, res) => {
  try {
    const { babyName, lullabyPlayed } = req.body;
    const session = await CrySession.create({ babyName, lullabyPlayed });

    const io = req.app.get('io');
    io.emit('session:started', { session });

    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/sessions  — list all sessions ──
router.get('/', async (_req, res) => {
  try {
    const sessions = await CrySession.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: sessions.length, sessions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/sessions/stats  — aggregated stats ──
router.get('/stats', async (_req, res) => {
  try {
    const total      = await CrySession.countDocuments();
    const withAlerts = await CrySession.countDocuments({ alertSent: true });
    const agg = await CrySession.aggregate([
      { $group: { _id: null, avgDuration: { $avg: '$durationSeconds' }, maxDuration: { $max: '$durationSeconds' } } }
    ]);
    res.json({
      success: true,
      stats: {
        totalSessions:    total,
        sessionsWithAlert: withAlerts,
        avgDurationSeconds: agg[0]?.avgDuration || 0,
        maxDurationSeconds: agg[0]?.maxDuration  || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/sessions/:id  — get single session ──
router.get('/:id', async (req, res) => {
  try {
    const session = await CrySession.findById(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/sessions/:id/end  — end a session ──
router.patch('/:id/end', async (req, res) => {
  try {
    const { durationSeconds, resolvedBy, notes } = req.body;
    const session = await CrySession.findByIdAndUpdate(
      req.params.id,
      { endTime: new Date(), durationSeconds, resolvedBy, notes },
      { new: true }
    );
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const io = req.app.get('io');
    io.emit('session:ended', { session });

    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/sessions/:id ──
router.delete('/:id', async (req, res) => {
  try {
    await CrySession.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;