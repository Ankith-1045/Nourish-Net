const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
  foodName: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  expiryDate: { type: Date, required: true },
  pickupAddress: { type: String, required: true },
  description: { type: String, default: '' },
  image: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Allocated', 'Completed'],
    default: 'Pending'
  },
  donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Donation', DonationSchema);
