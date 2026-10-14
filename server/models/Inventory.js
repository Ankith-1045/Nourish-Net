const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, default: 'Available' }, // e.g., Available, Expiring Soon, Depleted
  donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true }, // To link back
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', InventorySchema);
