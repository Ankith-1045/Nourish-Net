const mongoose = require('mongoose');

const DistributionReportSchema = new mongoose.Schema({
  donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ngoName: { type: String, required: true },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  donorName: { type: String, required: true },
  foodName: { type: String, required: true },
  quantity: { type: String, required: true },
  distributionDate: { type: Date, required: true },
  distributionLocation: { type: String, required: true },
  beneficiariesServed: { type: String, required: true },
  deliveryImages: { type: [String], default: [] },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  rejectionReason: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('DistributionReport', DistributionReportSchema);
