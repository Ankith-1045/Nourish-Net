const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { protect } = require('../middleware/auth');

// GET /api/inventory
// Supports filters like ?category=Bakery&search=Bread&sort=expiryDate
router.get('/', protect, async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.foodName = { $regex: search, $options: 'i' };
    }

    let sortObj = { createdAt: -1 };
    if (sort) {
      sortObj = {};
      sortObj[sort] = 1; // e.g. sort=expiryDate for soonest expiring first
    }

    const inventoryItems = await Inventory.find(query)
      .populate('donor', 'name')
      .sort(sortObj);

    // Calculate alerts
    const now = new Date();
    const expiringSoonAlerts = inventoryItems.filter(item => {
      if (item.status !== 'Available') return false;
      const hoursUntilExpiry = (new Date(item.expiryDate) - now) / (1000 * 60 * 60);
      return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24; // Less than 24 hours
    });

    const lowStockAlerts = inventoryItems.filter(item => {
       // Simple low stock logic: if quantity is less than 5 (assuming unit makes sense)
       return item.status === 'Available' && item.quantity < 5;
    });

    res.json({
      items: inventoryItems,
      alerts: {
        expiringSoon: expiringSoonAlerts.length,
        lowStock: lowStockAlerts.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/inventory/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const { status, quantity } = req.body;
    const inventoryItem = await Inventory.findById(req.params.id);

    if (!inventoryItem) {
      return res.status(404).json({ message: 'Inventory item not found' });
    }

    // Usually only admins or the respective donor should update, but keeping it flexible
    if (status) inventoryItem.status = status;
    if (quantity !== undefined) inventoryItem.quantity = quantity;
    inventoryItem.updatedAt = Date.now();

    const updatedItem = await inventoryItem.save();
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
