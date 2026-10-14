const express = require('express');
const router = express.Router();
const DistributionReport = require('../models/DistributionReport');
const Donation = require('../models/Donation');
const { protect, authorize } = require('../middleware/auth');
const Notification = require('../models/Notification');

const addNotification = async (userId, message) => {
  await Notification.create({ userId, message, read: false });
};

// GET /api/reports
router.get('/', protect, async (req, res) => {
  try {
    const reports = await DistributionReport.find({}).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/reports
router.post('/', protect, authorize('ngo'), async (req, res) => {
  try {
    const {
      donationId,
      donorId,
      donorName,
      foodName,
      quantity,
      distributionDate,
      distributionLocation,
      beneficiariesServed,
      deliveryImages,
      notes,
      ngoName,
    } = req.body;

    const donation = await Donation.findById(donationId);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    donation.status = 'Delivered';
    donation.deliveryImages = deliveryImages || [];
    donation.distributionLocation = distributionLocation;
    donation.distributionDate = distributionDate;
    donation.beneficiariesServed = beneficiariesServed;
    donation.distributionNotes = notes || '';
    donation.verificationStatus = 'Pending';
    donation.stageTimestamps = donation.stageTimestamps || {};
    donation.stageTimestamps.deliveredAt = new Date();
    await donation.save();

    const report = await DistributionReport.create({
      donationId,
      ngoId: req.user._id,
      ngoName: ngoName || req.user.organizationName || req.user.name,
      donorId,
      donorName,
      foodName,
      quantity,
      distributionDate,
      distributionLocation,
      beneficiariesServed,
      deliveryImages,
      notes,
      status: 'Pending',
    });

    await addNotification(donorId, `Your donation "${foodName}" now has distribution proof submitted by ${report.ngoName}.`);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/reports/:id
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { approved, rejectionReason } = req.body;
    const report = await DistributionReport.findById(req.params.id);
    if (!report) return res.status(404).json({ message: 'Report not found' });

    const donation = await Donation.findById(report.donationId);
    if (!donation) return res.status(404).json({ message: 'Donation not found' });

    if (approved) {
      report.status = 'Approved';
      donation.status = 'Verified';
      donation.verificationStatus = 'Verified';
      donation.verifiedBy = req.user.name;
      donation.verifiedAt = new Date();
      donation.stageTimestamps = donation.stageTimestamps || {};
      donation.stageTimestamps.verifiedAt = new Date();
      await donation.save();
      await addNotification(report.donorId, `Admin approved the verification for donation "${report.foodName}".`);
    } else {
      report.status = 'Rejected';
      report.rejectionReason = rejectionReason || 'Rejected by admin';
      donation.status = 'In Distribution';
      donation.verificationStatus = 'Rejected';
      donation.rejectionReason = report.rejectionReason;
      await donation.save();
      await addNotification(report.donorId, `Admin rejected the distribution proof for donation "${report.foodName}".`);
    }

    await report.save();
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
