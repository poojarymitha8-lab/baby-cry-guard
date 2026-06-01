// routes/parentRoutes.js

const express = require('express');
const router  = express.Router();
const Parent  = require('../models/Parent');

// ── POST /api/parents ──
router.post('/', async (req, res) => {
  try {
    const parent = await Parent.create(req.body);
    res.status(201).json({ success: true, parent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/parents ──
router.get('/', async (_req, res) => {
  try {
    const parents = await Parent.find().sort({ createdAt: -1 });
    res.json({ success: true, parents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/parents/:id ──
router.get('/:id', async (req, res) => {
  try {
    const parent = await Parent.findById(req.params.id);
    if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' });
    res.json({ success: true, parent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/parents/:id ──
router.put('/:id', async (req, res) => {
  try {
    const parent = await Parent.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!parent) return res.status(404).json({ success: false, message: 'Parent not found' });
    res.json({ success: true, parent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/parents/:id ──
router.delete('/:id', async (req, res) => {
  try {
    await Parent.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Parent deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;