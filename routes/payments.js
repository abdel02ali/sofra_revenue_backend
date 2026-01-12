const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const CustomerCredit = require('../models/CustomerCredit');

// Get all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payments by customer name
router.get('/customer/:customerName', async (req, res) => {
  try {
    const { customerName } = req.params;
    const payments = await Payment.find({ customer_name: customerName }).sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new payment
router.post('/', async (req, res) => {
  try {
    const { customer_name, amount, date, notes, payment_method } = req.body;

    if (!customer_name || amount === undefined) {
      return res.status(400).json({ error: 'customer_name and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Payment amount must be greater than 0' });
    }

    const payment = new Payment({
      customer_name,
      amount: parseFloat(amount),
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
      payment_method: payment_method || 'cash'
    });

    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  try {
    const { customer_name, amount, date, notes, payment_method } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        customer_name,
        amount: parseFloat(amount) || 0,
        date: date ? new Date(date) : new Date(),
        notes: notes || '',
        payment_method: payment_method || 'cash'
      },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const payment = await Payment.findByIdAndDelete(req.params.id);
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer balance (total credits - total payments)
router.get('/balance/:customerName', async (req, res) => {
  try {
    const { customerName } = req.params;
    
    const credits = await CustomerCredit.find({ customer_name: customerName });
    const totalCredits = credits.reduce((sum, credit) => sum + (credit.amount || 0), 0);
    
    const payments = await Payment.find({ customer_name: customerName });
    const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    
    const balance = totalCredits - totalPayments;
    
    res.json({
      customer_name: customerName,
      totalCredits,
      totalPayments,
      balance,
      creditCount: credits.length,
      paymentCount: payments.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

