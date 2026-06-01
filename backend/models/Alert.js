// models/Alert.js
// Records every alert sent to parents

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CrySession',
      required: true
    },
    babyName: {
      type: String,
      default: 'Baby'
    },
    parents: [
      {
        name:  { type: String },
        phone: { type: String }
      }
    ],
    message: {
      type: String,
      required: true
    },
    cryDurationSeconds: {
      type: Number,
      required: true
    },
    acknowledged: {
      type: Boolean,
      default: false
    },
    acknowledgedAt: {
      type: Date,
      default: null
    },
    acknowledgedBy: {
      type: String,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Alert', alertSchema);