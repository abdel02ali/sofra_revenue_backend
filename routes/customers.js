const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const CustomerCredit = require('../models/CustomerCredit');
const Payment = require('../models/Payment');

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search customers by name
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.json([]);
    }
    
    const customers = await Customer.find({
      name: { $regex: q, $options: 'i' }
    }).sort({ name: 1 }).limit(20);
    
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all customers with their total credits summary (must be before /:id route)
router.get('/summary/credits', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ name: 1 });
    
    const customersWithCredits = await Promise.all(
      customers.map(async (customer) => {
        const credits = await CustomerCredit.find({ customer_name: customer.name });
        const totalCredits = credits.reduce((sum, credit) => sum + (credit.amount || 0), 0);
        
        const payments = await Payment.find({ customer_name: customer.name });
        const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        const balance = totalCredits - totalPayments;
        
        return {
          ...customer.toObject(),
          totalCredits,
          totalPayments,
          balance,
          creditCount: credits.length,
          paymentCount: payments.length,
          lastCreditDate: credits.length > 0 
            ? credits.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date 
            : null
        };
      })
    );

    res.json(customersWithCredits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer with total credits (must be before /:id route)
router.get('/:id/credits', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const credits = await CustomerCredit.find({ customer_name: customer.name });
    const totalCredits = credits.reduce((sum, credit) => sum + (credit.amount || 0), 0);

    const payments = await Payment.find({ customer_name: customer.name });
    const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
    const balance = totalCredits - totalPayments;

    res.json({
      customer,
      credits,
      payments,
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

// Get customer by ID (must be after specific routes like /summary/credits and /:id/credits)
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Customer name is required' });
    }

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({ name: name.trim() });
    if (existingCustomer) {
      return res.status(400).json({ error: 'Customer with this name already exists' });
    }

    const customer = new Customer({
      name: name.trim(),
      phone: phone || '',
      email: email || '',
      notes: notes || ''
    });

    const savedCustomer = await customer.save();
    res.status(201).json(savedCustomer);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Customer with this name already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // If name is being changed, check for duplicates
    if (name && name.trim() !== customer.name) {
      const existingCustomer = await Customer.findOne({ name: name.trim() });
      if (existingCustomer) {
        return res.status(400).json({ error: 'Customer with this name already exists' });
      }
      
      // Update customer_name in all related credits
      await CustomerCredit.updateMany(
        { customer_name: customer.name },
        { $set: { customer_name: name.trim() } }
      );
    }

    if (name) customer.name = name.trim();
    if (phone !== undefined) customer.phone = phone;
    if (email !== undefined) customer.email = email;
    if (notes !== undefined) customer.notes = notes;

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Customer with this name already exists' });
    }
    res.status(400).json({ error: error.message });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Delete all related credits and payments
    await CustomerCredit.deleteMany({ customer_name: customer.name });
    await Payment.deleteMany({ customer_name: customer.name });
    
    // Delete the customer
    await Customer.deleteOne({ _id: req.params.id });
    res.json({ message: 'Customer and all associated credits/payments deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

