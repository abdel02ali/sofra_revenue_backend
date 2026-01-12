const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
    required: true,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  },
  payment_method: {
    type: String,
    default: 'cash',
    enum: ['cash', 'card', 'transfer', 'other']
  }
}, {
  timestamps: true
});

// Index for faster queries
paymentSchema.index({ customer_name: 1 });
paymentSchema.index({ date: -1 });

module.exports = mongoose.model('Payment', paymentSchema);

