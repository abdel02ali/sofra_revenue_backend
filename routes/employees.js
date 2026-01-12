const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const EmployeeConsumption = require('../models/EmployeeConsumption');
const EmployeeCredit = require('../models/EmployeeCredit');

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ name: 1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all employees with consumption summary (must be before /:id route)
router.get('/summary/consumption', async (req, res) => {
  try {
    const { year, month } = req.query;
    const employees = await Employee.find().sort({ name: 1 });
    
    const employeesWithConsumption = await Promise.all(
      employees.map(async (employee) => {
        let query = { employee_name: employee.name };
        if (year) query.year = parseInt(year);
        if (month) query.month = parseInt(month);

        const consumptions = await EmployeeConsumption.find(query)
          .sort({ year: -1, month: -1 });
        
        const totalConsumption = consumptions.reduce((sum, c) => sum + (c.consumption_amount || 0), 0);
        
        return {
          ...employee.toObject(),
          consumptions,
          totalConsumption,
          consumptionCount: consumptions.length
        };
      })
    );

    res.json(employeesWithConsumption);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get employee with consumption summary (must be before /:id route)
router.get('/:id/consumption', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const consumptions = await EmployeeConsumption.find({ employee_name: employee.name })
      .sort({ year: -1, month: -1 });

    res.json({
      employee,
      consumptions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get employee by ID (must be after specific routes like /summary/consumption and /:id/consumption)
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new employee
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, monthly_salary, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Employee name is required' });
    }

    const employee = new Employee({
      name: name.trim(),
      phone: phone || '',
      email: email || '',
      monthly_salary: parseFloat(monthly_salary) || 0,
      notes: notes || ''
    });

    const savedEmployee = await employee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Employee with this name already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, email, monthly_salary, notes } = req.body;

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // If name is being changed, update consumption records
    if (name && name.trim() !== employee.name) {
      const existingEmployee = await Employee.findOne({ name: name.trim() });
      if (existingEmployee) {
        return res.status(400).json({ error: 'Employee with this name already exists' });
      }
      
      await EmployeeConsumption.updateMany(
        { employee_name: employee.name },
        { $set: { employee_name: name.trim() } }
      );
    }

    if (name) employee.name = name.trim();
    if (phone !== undefined) employee.phone = phone;
    if (email !== undefined) employee.email = email;
    if (monthly_salary !== undefined) employee.monthly_salary = parseFloat(monthly_salary) || 0;
    if (notes !== undefined) employee.notes = notes;

    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Employee with this name already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Delete related consumption records and employee credits
    await EmployeeConsumption.deleteMany({ employee_name: employee.name });
    await EmployeeCredit.deleteMany({ employee_name: employee.name });
    
    // Delete the employee
    await Employee.deleteOne({ _id: req.params.id });
    
    res.json({ message: 'Employee and all associated credits/consumption records deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create consumption record
router.post('/consumption', async (req, res) => {
  try {
    const { employee_name, month, year, consumption_amount, notes } = req.body;

    if (!employee_name || month === undefined || year === undefined || consumption_amount === undefined) {
      return res.status(400).json({ error: 'employee_name, month, year, and consumption_amount are required' });
    }

    // Check if employee exists
    const employee = await Employee.findOne({ name: employee_name });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const consumption = new EmployeeConsumption({
      employee_name,
      month: parseInt(month),
      year: parseInt(year),
      consumption_amount: parseFloat(consumption_amount),
      notes: notes || ''
    });

    const savedConsumption = await consumption.save();
    res.status(201).json(savedConsumption);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Consumption record for this employee and month already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Update consumption record
router.put('/consumption/:id', async (req, res) => {
  try {
    const { employee_name, month, year, consumption_amount, notes } = req.body;

    const consumption = await EmployeeConsumption.findByIdAndUpdate(
      req.params.id,
      {
        employee_name,
        month: parseInt(month),
        year: parseInt(year),
        consumption_amount: parseFloat(consumption_amount),
        notes: notes || ''
      },
      { new: true, runValidators: true }
    );

    if (!consumption) {
      return res.status(404).json({ error: 'Consumption record not found' });
    }

    res.json(consumption);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete consumption record
router.delete('/consumption/:id', async (req, res) => {
  try {
    const consumption = await EmployeeConsumption.findByIdAndDelete(req.params.id);
    if (!consumption) {
      return res.status(404).json({ error: 'Consumption record not found' });
    }
    res.json({ message: 'Consumption record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

