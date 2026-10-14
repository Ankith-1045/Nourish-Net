const mongoose = require('mongoose');

const NgoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizationName: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  location: { type: String, required: true },
  capacity: { type: String, default: '100 meals/day' },
  requirements: [{ type: String }],
  approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('NGO', NgoSchema);
