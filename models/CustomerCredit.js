const mongoose = require('mongoose');

const customerCreditSchema = new mongoose.Schema({
  customer_name: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
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
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
customerCreditSchema.index({ date: -1 });
customerCreditSchema.index({ group: 1, time_group: 1, date: 1 });

module.exports = mongoose.model('CustomerCredit', customerCreditSchema);

