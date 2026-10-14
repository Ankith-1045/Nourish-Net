const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  foodCategory: { type: String, required: true },
  quantityRequired: { type: Number, required: true },
  urgency: { type: String, required: true },
  numberOfBeneficiaries: { type: Number, required: true },
  preferredPickupTime: { type: Date, required: true },
  remarks: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Fulfilled'],
    default: 'Pending'
  },
  ngo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Request', RequestSchema);
