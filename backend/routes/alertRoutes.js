// routes/alertRoutes.js

const express    = require('express');
const router     = express.Router();
const Alert      = require('../models/Alert');
const CrySession = require('../models/CrySession');

// ── POST /api/alerts  — create a new alert (baby crying > threshold) ──
router.post('/', async (req, res) => {
  try {
    const { sessionId, babyName, parents, cryDurationSeconds } = req.body;

    const message = `🚨 ${babyName || 'Baby'} has been crying for ${Math.floor(cryDurationSeconds / 60)}+ minutes. Please go and comfort them!`;

    const alert = await Alert.create({
      sessionId,
      babyName,
      parents,
      message,
      cryDurationSeconds
    });

    // Mark session as alert sent
    await CrySession.findByIdAndUpdate(sessionId, {
      alertSent: true,
      alertSentAt: new Date()
    });

    // Emit socket event to all connected parents
    const io = req.app.get('io');
    io.emit('alert:new', { alert, message });

    res.status(201).json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/alerts  — get all alerts ──
router.get('/', async (_req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, count: alerts.length, alerts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PATCH /api/alerts/:id/acknowledge  — parent acknowledged ──
router.patch('/:id/acknowledge', async (req, res) => {
  try {
    const { acknowledgedBy } = req.body;
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { acknowledged: true, acknowledgedAt: new Date(), acknowledgedBy },
      { new: true }
    );
    if (!alert) return res.status(404).json({ success: false, message: 'Alert not found' });

    const io = req.app.get('io');
    io.emit('alert:acknowledged', { alertId: alert._id, acknowledgedBy });

    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/alerts/:id ──
router.delete('/:id', async (req, res) => {
  try {
    await Alert.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Alert deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;