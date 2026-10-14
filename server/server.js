// Trigger restart
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const dns = require('dns');
const cors = require('cors');
const { MongoMemoryServer } = require('mongodb-memory-server');

const authRoutes = require('./routes/authRoutes');
const donationRoutes = require('./routes/donationRoutes');
const requestRoutes = require('./routes/requestRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const ngoRoutes = require('./routes/ngoRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const auditRoutes = require('./routes/auditRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const startServer = async () => {
  let mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    const memoryServer = await MongoMemoryServer.create();
    mongoUri = memoryServer.getUri();
    console.log('No MongoDB URI provided. Using in-memory MongoDB fallback.');
  }

  if (mongoUri.startsWith('mongodb+srv://')) {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
  }

  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log(`Connected to MongoDB at ${mongoUri}`);

  // Seed the database immediately so you don't even have to run seed.js
  const bcrypt = require('bcrypt');
  const User = require('./models/User');
  const Donation = require('./models/Donation');
  const Request = require('./models/FoodRequest');
  const Inventory = require('./models/Inventory');

  if ((await User.countDocuments()) === 0) {
    const salt = await bcrypt.genSalt(10);
    const hash = async (pw) => bcrypt.hash(pw, salt);

    const admin = await User.create({ name: 'Cognitude Admin', email: 'admin@cognitude.org', password: await hash('admin123'), role: 'admin' });
    const donor = await User.create({ name: 'GreenBites Bistro', email: 'donor@greenbites.com', password: await hash('donor123'), role: 'donor' });
    await User.create({ name: 'Sarah Connor', email: 'ngo@helpinghands.org', password: await hash('ngo123'), role: 'ngo' });
    console.log('Test users automatically seeded!');
  }

  const PORT = process.env.PORT || 5000;

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'NourishNet API is running' });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/donations', donationRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/inventory', inventoryRoutes);

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};

startServer();
