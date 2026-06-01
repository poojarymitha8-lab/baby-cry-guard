// models/CrySession.js
// Tracks each individual crying episode

const mongoose = require('mongoose');

const crySesionSchema = new mongoose.Schema(
  {
    babyName: {
      type: String,
      default: 'Baby',
      trim: true
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date,
      default: null
    },
    durationSeconds: {
      type: Number,
      default: 0
    },
    alertSent: {
      type: Boolean,
      default: false
    },
    alertSentAt: {
      type: Date,
      default: null
    },
    lullabyPlayed: {
      type: String,
      default: null
    },
    resolvedBy: {
      type: String,       // parent name who calmed baby
      default: null
    },
    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('CrySession', crySesionSchema);