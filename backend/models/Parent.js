// models/Parent.js

const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true, trim: true },
    phone:    { type: String, default: '' },
    email:    { type: String, default: '' },
    role:     { type: String, enum: ['mum', 'dad', 'guardian'], default: 'guardian' },
    babyName: { type: String, default: 'Baby' },
    alertThresholdSeconds: { type: Number, default: 300 }   // 5 min default
  },
  { timestamps: true }
);

module.exports = mongoose.model('Parent', parentSchema);