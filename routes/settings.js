const express = require('express');
const router = express.Router();
const Settings = require('../models/Settings');

// Get settings
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update settings
router.put('/', async (req, res) => {
  try {
    const { groups, currency } = req.body;

    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings({
        groups: groups || ['Group A', 'Group B'],
        currency: currency || '€'
      });
    } else {
      if (groups) settings.groups = groups;
      if (currency) settings.currency = currency;
    }

    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

