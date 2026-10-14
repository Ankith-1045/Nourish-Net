const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  role: { type: String, enum: ['donor', 'ngo', 'admin'], required: true },
  organizationName: { type: String, default: '' }, // Only for NGO
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
