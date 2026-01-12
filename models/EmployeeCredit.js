const mongoose = require('mongoose');

const employeeCreditSchema = new mongoose.Schema({
  employee_name: {
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
employeeCreditSchema.index({ date: -1 });
employeeCreditSchema.index({ group: 1, time_group: 1, date: 1 });
employeeCreditSchema.index({ employee_name: 1, date: -1 });

module.exports = mongoose.model('EmployeeCredit', employeeCreditSchema);

