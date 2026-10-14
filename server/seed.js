require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Donation = require('./models/Donation');
const Request = require('./models/FoodRequest');
const Inventory = require('./models/Inventory');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nourishnet_db';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Donation.deleteMany();
    await Request.deleteMany();
    await Inventory.deleteMany();

    console.log('Cleared existing data.');

    const salt = await bcrypt.genSalt(10);
    const hash = async (pw) => bcrypt.hash(pw, salt);

    // 1. Create Admin
    const admin = await User.create({
      name: 'Cognitude Admin',
      email: 'admin@cognitude.org',
      password: await hash('admin123'),
      role: 'admin',
      phone: '+1 (555) 019-2831',
      address: 'Cognitude HQ, Innovation Way, NY'
    });

    // 2. Create Donor
    const donor = await User.create({
      name: 'GreenBites Bistro',
      email: 'donor@greenbites.com',
      password: await hash('donor123'),
      role: 'donor',
      phone: '+1 (555) 392-1049',
      address: '458 Culinary Blvd, Downtown'
    });

    // 3. Create NGOs
    const ngo1 = await User.create({
      name: 'Sarah Connor',
      email: 'ngo@helpinghands.org',
      password: await hash('ngo123'),
      role: 'ngo',
      phone: '+1 (555) 883-9201',
      address: '102 Hope Avenue, Metro East',
      organizationName: 'Helping Hands Shelter'
    });

    const ngo2 = await User.create({
      name: 'Marcus Vance',
      email: 'ngo@hopeharvest.org',
      password: await hash('ngo123'),
      role: 'ngo',
      phone: '+1 (555) 441-2039',
      address: '77 Community Street, Northside',
      organizationName: 'Hope Harvest Foundation'
    });

    console.log('Created Users.');

    // 4. Create Donations & Inventory
    const d1 = await Donation.create({
      foodName: 'Surplus Chef Special Gourmet Dinner Boxes',
      category: 'Cooked Meals',
      quantity: 50,
      unit: 'meals',
      expiryDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      pickupAddress: '458 Culinary Blvd, Downtown',
      description: 'Freshly prepared Mediterranean rice bowls',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      status: 'Pending',
      donor: donor._id
    });
    await Inventory.create({
      foodName: d1.foodName,
      category: d1.category,
      quantity: d1.quantity,
      unit: d1.unit,
      expiryDate: d1.expiryDate,
      donor: d1.donor,
      status: 'Available',
      donationId: d1._id
    });

    const d2 = await Donation.create({
      foodName: 'Artisanal Sourdough & Baguettes',
      category: 'Bakery',
      quantity: 35,
      unit: 'loaves',
      expiryDate: new Date(Date.now() + 12 * 60 * 60 * 1000),
      pickupAddress: '458 Culinary Blvd, Downtown',
      description: 'Freshly baked artisanal bread assortment',
      image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
      status: 'Allocated',
      donor: donor._id
    });
    await Inventory.create({
      foodName: d2.foodName,
      category: d2.category,
      quantity: d2.quantity,
      unit: d2.unit,
      expiryDate: d2.expiryDate,
      donor: d2.donor,
      status: 'Allocated',
      donationId: d2._id
    });

    console.log('Created Donations and Inventory.');

    // 5. Create Requests
    await Request.create({
      foodCategory: 'Cooked Meals',
      quantityRequired: 60,
      urgency: 'Critical',
      numberOfBeneficiaries: 60,
      preferredPickupTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
      remarks: 'Need food immediately for evening service',
      status: 'Pending',
      ngo: ngo1._id
    });

    console.log('Created Requests.');
    console.log('Database seeded successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
