const mongoose = require('mongoose');

const employeeConsumptionSchema = new mongoose.Schema({
  employee_name: {
    type: String,
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true,
    min: 2000
  },
  consumption_amount: {
    type: Number,
    required: true,
    min: 0
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for faster queries
employeeConsumptionSchema.index({ employee_name: 1, year: 1, month: 1 });
employeeConsumptionSchema.index({ year: -1, month: -1 });

// Ensure unique consumption record per employee per month
employeeConsumptionSchema.index({ employee_name: 1, year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('EmployeeConsumption', employeeConsumptionSchema);

