const express = require('express');
const router = express.Router();
const Donation = require('../models/Donation');
const Inventory = require('../models/Inventory');
const { protect, authorize } = require('../middleware/auth');

// POST /api/donations (Create Donation & Inventory)
router.post('/', protect, authorize('donor'), async (req, res) => {
  try {
    const { foodName, category, quantity, unit, expiryDate, pickupAddress, description, image } = req.body;

    const donation = await Donation.create({
      foodName,
      category,
      quantity,
      unit,
      expiryDate,
      pickupAddress,
      description,
      image,
      donor: req.user._id,
      status: 'Pending'
    });

    // Auto-create in inventory
    await Inventory.create({
      foodName,
      category,
      quantity,
      unit,
      expiryDate,
      donor: req.user._id,
      donationId: donation._id,
      status: 'Available'
    });

    res.status(201).json(donation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/donations (Fetch all, or based on user role)
router.get('/', protect, async (req, res) => {
  try {
    let donations;
    if (req.user.role === 'donor') {
      donations = await Donation.find({ donor: req.user._id }).populate('donor', 'name');
    } else {
      donations = await Donation.find({}).populate('donor', 'name');
    }
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/donations/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id).populate('donor', 'name email phone');
    if (donation) {
      res.json(donation);
    } else {
      res.status(404).json({ message: 'Donation not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/donations/:id (Update donation & sync inventory)
router.put('/:id', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this donation' });
    }

    const { foodName, category, quantity, unit, expiryDate, pickupAddress, description, image, status } = req.body;

    donation.foodName = foodName || donation.foodName;
    donation.category = category || donation.category;
    donation.quantity = quantity || donation.quantity;
    donation.unit = unit || donation.unit;
    donation.expiryDate = expiryDate || donation.expiryDate;
    donation.pickupAddress = pickupAddress || donation.pickupAddress;
    donation.description = description || donation.description;
    donation.image = image || donation.image;
    donation.status = status || donation.status;

    const updatedDonation = await donation.save();

    // Sync with Inventory
    const inventory = await Inventory.findOne({ donationId: donation._id });
    if (inventory) {
      inventory.foodName = updatedDonation.foodName;
      inventory.category = updatedDonation.category;
      inventory.quantity = updatedDonation.quantity;
      inventory.unit = updatedDonation.unit;
      inventory.expiryDate = updatedDonation.expiryDate;
      inventory.updatedAt = Date.now();
      
      if (updatedDonation.status === 'Completed' || updatedDonation.status === 'Allocated') {
        inventory.status = updatedDonation.status === 'Completed' ? 'Depleted' : 'Allocated';
      } else {
        inventory.status = 'Available';
      }
      
      await inventory.save();
    }

    res.json(updatedDonation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/donations/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    if (donation.donor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this donation' });
    }

    await Donation.deleteOne({ _id: donation._id });
    // Remove from inventory
    await Inventory.deleteOne({ donationId: donation._id });

    res.json({ message: 'Donation removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
