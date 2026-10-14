const express = require('express');
const router = express.Router();
const Ngo = require('../models/NGO');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// GET /api/ngos
router.get('/', protect, async (req, res) => {
  try {
    const ngos = await Ngo.find({});
    res.json(ngos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/ngos/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const ngo = await Ngo.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    res.json(ngo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/ngos/:id/status
router.put('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { approvalStatus } = req.body;
    const ngo = await Ngo.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    ngo.approvalStatus = approvalStatus;
    await ngo.save();
    res.json(ngo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/ngos/:id
router.put('/:id', protect, authorize('ngo', 'admin'), async (req, res) => {
  try {
    const updates = req.body;
    const ngo = await Ngo.findById(req.params.id);
    if (!ngo) return res.status(404).json({ message: 'NGO not found' });
    if (req.user.role === 'ngo' && ngo.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this NGO profile' });
    }
    Object.assign(ngo, updates);
    await ngo.save();
    res.json(ngo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
