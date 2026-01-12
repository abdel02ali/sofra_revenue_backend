const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  group: {
    type: String,
    required: true
  },
  time_group: {
    type: String,
    required: true,
    enum: ['7am to 2pm', '2pm to 10pm']
  },
  billet: {
    type: Number,
    default: 0
  },
  money: {
    type: Number,
    default: 0
  },
  total_calculated: {
    type: Number,
    default: 0
  },
  font_caisse: {
    type: Number,
    default: 0
  },
  total_credit: {
    type: Number,
    default: 0
  },
  total_achat: {
    type: Number,
    default: 0
  },
  total_journal: {
    type: Number,
    default: 0
  },
  total_calculated_formula: {
    type: Number,
    default: 0
  },
  difference: {
    type: Number,
    default: 0
  },
  daily_revenue: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
entrySchema.index({ date: -1 });
entrySchema.index({ group: 1, time_group: 1, date: 1 });

module.exports = mongoose.model('Entry', entrySchema);

