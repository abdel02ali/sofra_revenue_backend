const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  groups: {
    type: [String],
    default: ['Group A', 'Group B']
  },
  currency: {
    type: String,
    default: '€'
  }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      groups: ['Group A', 'Group B'],
      currency: '€'
    });
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);

