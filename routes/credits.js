const express = require('express');
const router = express.Router();
const CustomerCredit = require('../models/CustomerCredit');

// Get all customer credits
router.get('/', async (req, res) => {
  try {
    const credits = await CustomerCredit.find().sort({ date: -1 });
    res.json(credits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get credits by entry criteria (date, group, time_group)
router.get('/by-entry', async (req, res) => {
  try {
    const { date, group, time_group } = req.query;
    
    if (!date || !group || !time_group) {
      return res.status(400).json({ error: 'date, group, and time_group are required' });
    }

    const credits = await CustomerCredit.find({
      date: new Date(date),
      group,
      time_group
    }).sort({ createdAt: -1 });

    res.json(credits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get credit by ID
router.get('/:id', async (req, res) => {
  try {
    const credit = await CustomerCredit.findById(req.params.id);
    if (!credit) {
      return res.status(404).json({ error: 'Credit not found' });
    }
    res.json(credit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new customer credit
router.post('/', async (req, res) => {
  try {
    const { customer_name, amount, date, group, time_group, notes } = req.body;

    if (!customer_name || amount === undefined) {
      return res.status(400).json({ error: 'customer_name and amount are required' });
    }

    const credit = new CustomerCredit({
      customer_name,
      amount: parseFloat(amount) || 0,
      date: new Date(date),
      group,
      time_group,
      notes: notes || ''
    });

    const savedCredit = await credit.save();
    res.status(201).json(savedCredit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update customer credit
router.put('/:id', async (req, res) => {
  try {
    const { customer_name, amount, date, group, time_group, notes } = req.body;

    const credit = await CustomerCredit.findByIdAndUpdate(
      req.params.id,
      {
        customer_name,
        amount: parseFloat(amount) || 0,
        date: new Date(date),
        group,
        time_group,
        notes: notes || ''
      },
      { new: true, runValidators: true }
    );

    if (!credit) {
      return res.status(404).json({ error: 'Credit not found' });
    }

    res.json(credit);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete customer credit
router.delete('/:id', async (req, res) => {
  try {
    const credit = await CustomerCredit.findByIdAndDelete(req.params.id);
    if (!credit) {
      return res.status(404).json({ error: 'Credit not found' });
    }
    res.json({ message: 'Credit deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all credits
router.delete('/', async (req, res) => {
  try {
    await CustomerCredit.deleteMany({});
    res.json({ message: 'All credits deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

