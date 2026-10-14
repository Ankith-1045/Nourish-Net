const express = require('express');
const router = express.Router();
const Request = require('../models/FoodRequest');
const { protect, authorize } = require('../middleware/auth');

// POST /api/requests
router.post('/', protect, authorize('ngo'), async (req, res) => {
  try {
    const { foodCategory, quantityRequired, urgency, numberOfBeneficiaries, preferredPickupTime, remarks } = req.body;

    const request = await Request.create({
      foodCategory,
      quantityRequired,
      urgency,
      numberOfBeneficiaries,
      preferredPickupTime,
      remarks,
      ngo: req.user._id,
      status: 'Pending'
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/requests
router.get('/', protect, async (req, res) => {
  try {
    let requests;
    if (req.user.role === 'ngo') {
      requests = await Request.find({ ngo: req.user._id }).populate('ngo', 'name organizationName');
    } else {
      requests = await Request.find({}).populate('ngo', 'name organizationName');
    }
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/requests/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id).populate('ngo', 'name email phone organizationName');
    if (request) {
      res.json(request);
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/requests/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.ngo.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this request' });
    }

    const { foodCategory, quantityRequired, urgency, numberOfBeneficiaries, preferredPickupTime, remarks, status } = req.body;

    request.foodCategory = foodCategory || request.foodCategory;
    request.quantityRequired = quantityRequired || request.quantityRequired;
    request.urgency = urgency || request.urgency;
    request.numberOfBeneficiaries = numberOfBeneficiaries || request.numberOfBeneficiaries;
    request.preferredPickupTime = preferredPickupTime || request.preferredPickupTime;
    request.remarks = remarks || request.remarks;
    if (req.user.role === 'admin' && status) {
       request.status = status;
    } else if (req.user.role === 'ngo' && status && status === 'Fulfilled') { // Or cancelled
       request.status = status;
    }

    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/requests/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.ngo.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this request' });
    }

    await Request.deleteOne({ _id: request._id });
    res.json({ message: 'Request removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
