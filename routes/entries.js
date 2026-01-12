const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');

// Get all entries
router.get('/', async (req, res) => {
  try {
    const entries = await Entry.find().sort({ date: -1 });
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get entry by ID
router.get('/:id', async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new entry
router.post('/', async (req, res) => {
  try {
    const {
      date,
      group,
      time_group,
      billet,
      money,
      font_caisse,
      total_credit,
      total_achat,
      total_journal,
      notes
    } = req.body;

    const total_calculated = (billet || 0) + (money || 0);
    const total_calculated_formula = total_calculated + (total_credit || 0) + (total_achat || 0) - (font_caisse || 0);
    const difference = total_calculated_formula - (total_journal || 0);
    const daily_revenue = (total_journal || 0) - (total_achat || 0);

    const entry = new Entry({
      date: new Date(date),
      group,
      time_group,
      billet: billet || 0,
      money: money || 0,
      total_calculated,
      font_caisse: font_caisse || 0,
      total_credit: total_credit || 0,
      total_achat: total_achat || 0,
      total_journal: total_journal || 0,
      total_calculated_formula,
      difference,
      daily_revenue,
      notes: notes || ''
    });

    const savedEntry = await entry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update entry
router.put('/:id', async (req, res) => {
  try {
    const {
      date,
      group,
      time_group,
      billet,
      money,
      font_caisse,
      total_credit,
      total_achat,
      total_journal,
      notes
    } = req.body;

    const total_calculated = (billet || 0) + (money || 0);
    const total_calculated_formula = total_calculated + (total_credit || 0) + (total_achat || 0) - (font_caisse || 0);
    const difference = total_calculated_formula - (total_journal || 0);
    const daily_revenue = (total_journal || 0) - (total_achat || 0);

    const entry = await Entry.findByIdAndUpdate(
      req.params.id,
      {
        date: new Date(date),
        group,
        time_group,
        billet: billet || 0,
        money: money || 0,
        total_calculated,
        font_caisse: font_caisse || 0,
        total_credit: total_credit || 0,
        total_achat: total_achat || 0,
        total_journal: total_journal || 0,
        total_calculated_formula,
        difference,
        daily_revenue,
        notes: notes || ''
      },
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json(entry);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete entry
router.delete('/:id', async (req, res) => {
  try {
    const entry = await Entry.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all entries
router.delete('/', async (req, res) => {
  try {
    await Entry.deleteMany({});
    res.json({ message: 'All entries deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

