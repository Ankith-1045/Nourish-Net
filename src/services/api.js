/**
 * Client API Service with localStorage persistence and seed mock data
 * Supports Authentication, Role-based Access, NGO Approvals, Donation CRUD,
 * Food Requests, and Recommendation Calculation.
 */

import { calculateNgoRecommendations } from './recommendationEngine';

const STORAGE_KEYS = {
  USERS: 'cognitude_users',
  NGOS: 'cognitude_ngos',
  DONATIONS: 'cognitude_donations',
  REQUESTS: 'cognitude_requests',
  DISTRIBUTION_REPORTS: 'cognitude_distribution_reports',
  AUDIT_LOGS: 'cognitude_audit_logs',
  NOTIFICATIONS: 'cognitude_notifications',
  CURRENT_USER: 'cognitude_current_user',
  TOKEN: 'cognitude_token',
};

// Initial Seed Data
const INITIAL_USERS = [
  {
    id: 'u_admin_1',
    name: 'Cognitude Admin',
    email: 'admin@cognitude.org',
    password: 'admin123',
    role: 'admin',
    phone: '+1 (555) 019-2831',
    address: 'Cognitude HQ, Innovation Way, NY',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u_donor_1',
    name: 'GreenBites Bistro',
    email: 'donor@greenbites.com',
    password: 'donor123',
    role: 'donor',
    phone: '+1 (555) 392-1049',
    address: '458 Culinary Blvd, Downtown',
    latitude: 40.7128,
    longitude: -74.0060,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u_ngo_1',
    name: 'Sarah Connor',
    email: 'ngo@helpinghands.org',
    password: 'ngo123',
    role: 'ngo',
    phone: '+1 (555) 883-9201',
    address: '102 Hope Avenue, Metro East',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u_ngo_2',
    name: 'Marcus Vance',
    email: 'ngo@hopeharvest.org',
    password: 'ngo123',
    role: 'ngo',
    phone: '+1 (555) 441-2039',
    address: '77 Community Street, Northside',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'u_ngo_3',
    name: 'Elena Rostova',
    email: 'ngo@nourishcity.org',
    password: 'ngo123',
    role: 'ngo',
    phone: '+1 (555) 902-1144',
    address: '312 Shelter Road, Westside',
    latitude: 40.7170,
    longitude: -74.0080,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_NGOS = [
  {
    id: 'ngo_1',
    userId: 'u_ngo_1',
    organizationName: 'Helping Hands Shelter',
    registrationNumber: 'NGO-88402-NY',
    location: '102 Hope Avenue, Metro East',
    latitude: 40.7138,
    longitude: -74.0065,
    capacity: '200 meals/day',
    requirements: ['Cooked Meals', 'Fresh Produce', 'Bakery'],
    approvalStatus: 'approved',
    trustScore: 100,
    contactPerson: 'Sarah Connor',
    contactEmail: 'ngo@helpinghands.org',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ngo_2',
    userId: 'u_ngo_2',
    organizationName: 'Hope Harvest Foundation',
    registrationNumber: 'NGO-77319-NY',
    location: '77 Community Street, Northside',
    latitude: 40.7150,
    longitude: -74.0040,
    capacity: '150 meals/day',
    requirements: ['Packaged Food', 'Beverages', 'Grocery'],
    approvalStatus: 'approved',
    contactPerson: 'Marcus Vance',
    contactEmail: 'ngo@hopeharvest.org',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ngo_3',
    userId: 'u_ngo_3',
    organizationName: 'Nourish City Charity',
    registrationNumber: 'NGO-99201-PENDING',
    location: '312 Shelter Road, Westside',
    latitude: 40.7170,
    longitude: -74.0080,
    capacity: '100 meals/day',
    requirements: ['Cooked Meals', 'Dairy'],
    approvalStatus: 'pending',
    contactPerson: 'Elena Rostova',
    contactEmail: 'ngo@nourishcity.org',
    createdAt: new Date().toISOString(),
  },
];

const now = new Date();
const in4Hours = new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString();
const in12Hours = new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString();
const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

const INITIAL_DONATIONS = [
  {
    id: 'don_1',
    donorId: 'u_donor_1',
    donorName: 'GreenBites Bistro',
    foodName: 'Surplus Chef Special Gourmet Dinner Boxes',
    category: 'Cooked Meals',
    quantity: '50 meals',
    description: 'Freshly prepared Mediterranean rice bowls with roasted vegetables and lean protein.',
    preparedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
    expiryAt: in4Hours,
    pickupAddress: '458 Culinary Blvd, Downtown',
    pickupLat: 40.7128,
    pickupLng: -74.0060,
    contactPhone: '+1 (555) 392-1049',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
    status: 'Pending',
    assignedNgo: null,
    assignedNgoName: null,
    notifiedNgoIds: [],
    notificationWave: 1,
    deliveryImages: [],
    distributionDate: null,
    distributionLocation: '',
    beneficiariesServed: null,
    distributionNotes: '',
    verificationStatus: null,
    verifiedBy: null,
    verifiedAt: null,
    rejectionReason: null,
    stageTimestamps: {
      createdAt: new Date().toISOString(),
      acceptedAt: null,
      inDistributionAt: null,
      deliveredAt: null,
      verifiedAt: null,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'don_2',
    donorId: 'u_donor_1',
    donorName: 'GreenBites Bistro',
    foodName: 'Artisanal Sourdough & Baguettes',
    category: 'Bakery',
    quantity: '35 loaves',
    description: 'Freshly baked artisanal bread assortment from today morning session.',
    preparedAt: new Date(now.getTime() - 8 * 60 * 60 * 1000).toISOString(),
    expiryAt: in12Hours,
    pickupAddress: '458 Culinary Blvd, Downtown',
    pickupLat: 40.7128,
    pickupLng: -74.0060,
    contactPhone: '+1 (555) 392-1049',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
    status: 'Pending',
    assignedNgo: 'ngo_1',
    assignedNgoName: 'Helping Hands Shelter',
    notifiedNgoIds: [],
    notificationWave: 1,
    deliveryImages: [],
    distributionDate: null,
    distributionLocation: '',
    beneficiariesServed: null,
    distributionNotes: '',
    verificationStatus: null,
    verifiedBy: null,
    verifiedAt: null,
    rejectionReason: null,
    stageTimestamps: {
      createdAt: new Date().toISOString(),
      acceptedAt: null,
      inDistributionAt: null,
      deliveredAt: null,
      verifiedAt: null,
    },
    createdAt: new Date().toISOString(),
  },
  {
    id: 'don_3',
    donorId: 'u_donor_1',
    donorName: 'GreenBites Bistro',
    foodName: 'Fresh Organic Produce Baskets',
    category: 'Fresh Produce',
    quantity: '25 kg',
    description: 'Assorted fresh kale, carrots, tomatoes, and bell peppers.',
    preparedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    expiryAt: in24Hours,
    pickupAddress: '458 Culinary Blvd, Downtown',
    pickupLat: 40.7128,
    pickupLng: -74.0060,
    contactPhone: '+1 (555) 392-1049',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=80',
    status: 'Accepted by NGO',
    assignedNgo: 'ngo_2',
    assignedNgoName: 'Hope Harvest Foundation',
    notifiedNgoIds: [],
    notificationWave: 1,
    deliveryImages: [],
    distributionDate: null,
    distributionLocation: '',
    beneficiariesServed: null,
    distributionNotes: '',
    verificationStatus: null,
    verifiedBy: null,
    verifiedAt: null,
    rejectionReason: null,
    stageTimestamps: {
      createdAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
      inDistributionAt: null,
      deliveredAt: null,
      verifiedAt: null,
    },
    createdAt: new Date().toISOString(),
  }
];

const INITIAL_DISTRIBUTION_REPORTS = [];
const INITIAL_AUDIT_LOGS = [];
const INITIAL_NOTIFICATIONS = [];

const INITIAL_REQUESTS = [
  {
    id: 'req_1',
    ngoId: 'ngo_1',
    ngoName: 'Helping Hands Shelter',
    foodCategory: 'Cooked Meals',
    category: 'Cooked Meals',
    quantityRequired: '60 meals',
    urgency: 'High',
    requiredBefore: new Date(now.getTime() + 18 * 60 * 60 * 1000).toISOString(),
    reason: 'Urgent evening shelter meal program for 60 homeless individuals.',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'req_2',
    ngoId: 'ngo_2',
    ngoName: 'Hope Harvest Foundation',
    foodCategory: 'Packaged Food',
    category: 'Packaged Food',
    quantityRequired: '40 kg',
    urgency: 'Medium',
    requiredBefore: new Date(now.getTime() + 36 * 60 * 60 * 1000).toISOString(),
    reason: 'Weekly staple food hamper distribution for low-income families.',
    status: 'Approved',
    createdAt: new Date().toISOString(),
  },
];

// Helper to seed localStorage
function getStoredData(key, defaultVal) {
  try {
    const item = localStorage.getItem(key);
    if (!item) {
      localStorage.setItem(key, JSON.stringify(defaultVal));
      return defaultVal;
    }
    return JSON.parse(item);
  } catch {
    return defaultVal;
  }
}

function setStoredData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Storage set error:', e);
  }
}

function addNotification(userId, message) {
  const notifications = getStoredData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  const newNotification = {
    id: `notif_${Date.now()}`,
    userId,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  };
  notifications.unshift(newNotification);
  setStoredData(STORAGE_KEYS.NOTIFICATIONS, notifications);
  return newNotification;
}

function ensureNgoNotification(userId, message) {
  if (!userId) return;
  const notifications = getStoredData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  if (notifications.some((notification) => notification.userId === userId && notification.message === message)) return;
  addNotification(userId, message);
}

function getNgoUserId(ngoId) {
  if (!ngoId) return null;
  const ngo = getStoredData(STORAGE_KEYS.NGOS, INITIAL_NGOS).find(
    (item) => item.id === ngoId || item.userId === ngoId,
  );
  return ngo?.userId || null;
}

function addAuditLog(userId, action, donationId, metadata = {}) {
  const auditLogs = getStoredData(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  const newLog = {
    id: `log_${Date.now()}`,
    userId,
    action,
    donationId,
    metadata,
    createdAt: new Date().toISOString(),
  };
  auditLogs.unshift(newLog);
  setStoredData(STORAGE_KEYS.AUDIT_LOGS, auditLogs);
  return newLog;
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return 6371 * c;
}

function getNgoByUser(user) {
  const ngos = getStoredData(STORAGE_KEYS.NGOS, INITIAL_NGOS);
  return ngos.find((n) => n.userId === user.id || n.contactEmail === user.email || n.organizationName === user.name) || null;
}

function getApprovedNgos() {
  return getStoredData(STORAGE_KEYS.NGOS, INITIAL_NGOS).filter((ngo) => ngo.approvalStatus === 'approved');
}

function getNgosWithinRadius(lat, lng, radiusKm, excludeIds = []) {
  return getApprovedNgos()
    .filter((ngo) => ngo.latitude != null && ngo.longitude != null)
    .map((ngo) => ({
      ...ngo,
      distanceKm:
        lat != null && lng != null
          ? getDistanceKm(lat, lng, ngo.latitude, ngo.longitude)
          : Number.POSITIVE_INFINITY,
    }))
    .filter((ngo) => ngo.distanceKm <= radiusKm && !excludeIds.includes(ngo.id))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

function notifyNgoBatchForDonation(donation, radiusKm = 1, maxNotify = 3) {
  const notifiedIds = donation.notifiedNgoIds || [];
  const hasPickupLocation = donation.pickupLat != null && donation.pickupLng != null;
  const candidates = hasPickupLocation
    ? getNgosWithinRadius(donation.pickupLat, donation.pickupLng, radiusKm, notifiedIds)
    : [];
  const selected = candidates.slice(0, maxNotify);

  if (selected.length === 0) {
    const allApproved = getApprovedNgos()
      .filter((ngo) => !notifiedIds.includes(ngo.id))
      .map((ngo) => ({
        ...ngo,
        distanceKm: hasPickupLocation
          ? getDistanceKm(donation.pickupLat, donation.pickupLng, ngo.latitude, ngo.longitude)
          : Number.POSITIVE_INFINITY,
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, maxNotify);
    selected.push(...allApproved);
  }

  const notifications = getStoredData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  selected.forEach((ngo) => {
    const notification = {
      id: `notif_${Date.now()}_${ngo.id}`,
      userId: ngo.userId,
      message: `New donation available within ${radiusKm}km: ${donation.foodName} (${donation.quantity}). Respond within 10 minutes to claim it.`,
      createdAt: new Date().toISOString(),
      read: false,
    };
    notifications.unshift(notification);
    addAuditLog(ngo.userId, 'Donation Nearby Notification Sent', donation.id, { ngoId: ngo.id, distanceKm: ngo.distanceKm });
    donation.notifiedNgoIds = [...new Set([...(donation.notifiedNgoIds || []), ngo.id])];
  });
  setStoredData(STORAGE_KEYS.NOTIFICATIONS, notifications);
}

function getNextNotificationBatch(donation) {
  const notifiedIds = donation.notifiedNgoIds || [];
  return getApprovedNgos()
    .filter((ngo) => !notifiedIds.includes(ngo.id) && ngo.latitude != null && ngo.longitude != null)
    .map((ngo) => ({
      ...ngo,
      distanceKm:
        donation.pickupLat != null && donation.pickupLng != null
          ? getDistanceKm(donation.pickupLat, donation.pickupLng, ngo.latitude, ngo.longitude)
          : Number.POSITIVE_INFINITY,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

function maybeAdvanceNotificationWave(donation) {
  if (!donation.pickupLat || !donation.pickupLng || donation.status !== 'Pending') return donation;
  const createdAt = new Date(donation.createdAt);
  const now = new Date();
  const minutesSincePost = (now - createdAt) / (1000 * 60);
  if ((donation.notificationWave || 1) === 1 && minutesSincePost >= 10) {
    const nextBatch = getNextNotificationBatch(donation).slice(0, 3);
    if (nextBatch.length === 0) {
      donation.notificationWave = 2;
      return donation;
    }

    const notifications = getStoredData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    nextBatch.forEach((ngo) => {
      const notification = {
        id: `notif_${Date.now()}_${ngo.id}`,
        userId: ngo.userId,
        message: `Donation still available nearby: ${donation.foodName} (${donation.quantity}). You're now in the second notification wave.`,
        createdAt: new Date().toISOString(),
        read: false,
      };
      notifications.unshift(notification);
      addAuditLog(ngo.userId, 'Donation Fallback Notification Sent', donation.id, { ngoId: ngo.id, distanceKm: ngo.distanceKm });
      donation.notifiedNgoIds = [...new Set([...(donation.notifiedNgoIds || []), ngo.id])];
    });
    setStoredData(STORAGE_KEYS.NOTIFICATIONS, notifications);
    donation.notificationWave = 2;
  }
  return donation;
}

function updateNgoTrustScore(ngoId, delta) {
  const ngos = getStoredData(STORAGE_KEYS.NGOS, INITIAL_NGOS);
  const idx = ngos.findIndex((n) => n.id === ngoId);
  if (idx !== -1) {
    ngos[idx].trustScore = Math.max(0, (ngos[idx].trustScore || 100) + delta);
    setStoredData(STORAGE_KEYS.NGOS, ngos);
    return ngos[idx];
  }
  return null;
}

// API Object
export const api = {
  // Auth Operations
  login: async (email, password, role) => {
    const users = getStoredData(STORAGE_KEYS.USERS, INITIAL_USERS);
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );

    if (!user) {
      throw new Error(`No ${role} account found with email "${email}".`);
    }

    if (user.password !== password) {
      throw new Error('Incorrect password. Please try again.');
    }

    // Check if NGO is approved
    if (user.role === 'ngo') {
      const ngos = getStoredData(STORAGE_KEYS.NGOS, INITIAL_NGOS);
      const ngo = ngos.find((n) => n.userId === user.id || n.contactEmail === user.email);
      if (ngo && ngo.approvalStatus === 'pending') {
        throw new Error('Your NGO registration is pending Admin approval.');
      }
      if (ngo && ngo.approvalStatus === 'rejected') {
        throw new Error('Your NGO registration application was not approved by Admin.');
      }
    }

    const token = `jwt_token_${user.id}_${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));

    return { user, token };
  },

  registerDonor: async ({ name, email, password, phone, address }) => {
    const users = getStoredData(STORAGE_KEYS.USERS, INITIAL_USERS);
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }

    const newUser = {
      id: `u_donor_${Date.now()}`,
      name,
      email,
      password,
      role: 'donor',
      phone,
      address,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setStoredData(STORAGE_KEYS.USERS, users);

    const token = `jwt_token_${newUser.id}_${Date.now()}`;
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));

    return { user: newUser, token };
  },

  registerNgo: async ({
    organizationName,
    registrationNumber,
    contactPerson,
    email,
    password,
    phone,
    location,
    capacity,
    requirements,
  }) => {
    const users = getStoredData(STORAGE_KEYS.USERS, INITIAL_USERS);
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }

    const userId = `u_ngo_${Date.now()}`;
    const ngoId = `ngo_${Date.now()}`;

    const newUser = {
      id: userId,
      name: contactPerson || organizationName,
      email,
      password,
      role: 'ngo',
      phone,
      address: location,
      createdAt: new Date().toISOString(),
    };

    const newNgo = {
      id: ngoId,
      userId,
      organizationName,
      registrationNumber,
      location,
      capacity: capacity ? `${capacity} meals/day` : '100 meals/day',
      requirements: Array.isArray(requirements)
        ? requirements
        : typeof requirements === 'string'
        ? requirements.split(',').map((s) => s.trim())
        : ['Cooked Meals'],
      approvalStatus: 'pending',
      contactPerson,
      contactEmail: email,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setStoredData(STORAGE_KEYS.USERS, users);

    const ngos = getStoredData(STORAGE_KEYS.NGOS, INITIAL_NGOS);
    ngos.push(newNgo);
    setStoredData(STORAGE_KEYS.NGOS, ngos);

    return { message: 'Registration submitted! Awaiting admin approval.', ngo: newNgo };
  },

  getCurrentUser: () => {
    try {
      const u = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  // NGO Management
  getNgos: () => {
    return getStoredData(STORAGE_KEYS.NGOS, INITIAL_NGOS);
  },

  updateNgoStatus: (ngoId, approvalStatus) => {
    const ngos = getStoredData(STORAGE_KEYS.NGOS, INITIAL_NGOS);
    const idx = ngos.findIndex((n) => n.id === ngoId);
    if (idx !== -1) {
      ngos[idx].approvalStatus = approvalStatus;
      setStoredData(STORAGE_KEYS.NGOS, ngos);
    }
    return ngos;
  },

  updateNgoProfile: (ngoId, updates) => {
    const ngos = getStoredData(STORAGE_KEYS.NGOS, INITIAL_NGOS);
    const idx = ngos.findIndex((n) => n.id === ngoId || n.userId === ngoId);
    if (idx !== -1) {
      ngos[idx] = { ...ngos[idx], ...updates };
      setStoredData(STORAGE_KEYS.NGOS, ngos);
    }
    return ngos[idx];
  },

  // Donor Management
  getDonors: () => {
    const users = getStoredData(STORAGE_KEYS.USERS, INITIAL_USERS);
    return users.filter((u) => u.role === 'donor');
  },

  // Donation CRUD
  getDonations: () => {
    const donations = getStoredData(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
    const updatedDonations = donations.map((donation) => maybeAdvanceNotificationWave(donation));
    setStoredData(STORAGE_KEYS.DONATIONS, updatedDonations);
    return updatedDonations;
  },

  checkPendingDonationNotifications: () => {
    const donations = getStoredData(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
    const updatedDonations = donations.map((donation) => maybeAdvanceNotificationWave(donation));
    setStoredData(STORAGE_KEYS.DONATIONS, updatedDonations);
    return updatedDonations;
  },

  createDonation: (donationData, donorUser) => {
    const donations = getStoredData(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
    const createdAt = new Date().toISOString();
    const newDonation = {
      id: `don_${Date.now()}`,
      donorId: donorUser.id,
      donorName: donorUser.name,
      foodName: donationData.foodName,
      category: donationData.category || 'Cooked Meals',
      quantity: donationData.quantity,
      description: donationData.description,
      preparedAt: donationData.preparedAt || new Date().toISOString(),
      expiryAt: donationData.expiryAt || new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
      pickupAddress: donationData.pickupAddress || donorUser.address,
      pickupLat: donationData.pickupLat || donorUser.latitude || null,
      pickupLng: donationData.pickupLng || donorUser.longitude || null,
      contactPhone: donationData.contactPhone || donorUser.phone,
      image: donationData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      status: 'Pending',
      assignedNgo: null,
      assignedNgoName: null,
      notifiedNgoIds: [],
      notificationWave: 1,
      deliveryImages: [],
      distributionDate: null,
      distributionLocation: '',
      beneficiariesServed: null,
      distributionNotes: '',
      verificationStatus: null,
      verifiedBy: null,
      verifiedAt: null,
      rejectionReason: null,
      stageTimestamps: {
        createdAt,
        acceptedAt: null,
        inDistributionAt: null,
        deliveredAt: null,
        verifiedAt: null,
      },
      createdAt,
    };

    donations.unshift(newDonation);
    setStoredData(STORAGE_KEYS.DONATIONS, donations);
    addAuditLog(donorUser.id, 'Donation Created', newDonation.id, { foodName: newDonation.foodName });
    notifyNgoBatchForDonation(newDonation, 1, 3);
    setStoredData(STORAGE_KEYS.DONATIONS, donations);
    return newDonation;
  },

  updateDonationStatus: (donationId, status, assignedNgoId = null, assignedNgoName = null) => {
    const donations = getStoredData(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
    const idx = donations.findIndex((d) => d.id === donationId);
    if (idx !== -1) {
      const donation = donations[idx];
      donation.status = status;
      if (assignedNgoId) donation.assignedNgo = assignedNgoId;
      if (assignedNgoName) donation.assignedNgoName = assignedNgoName;

      const now = new Date().toISOString();
      if (status === 'Accepted by NGO') {
        donation.stageTimestamps.acceptedAt = now;
        donation.verificationStatus = null;
        addNotification(donation.donorId, `Your donation "${donation.foodName}" was accepted by ${assignedNgoName || 'an NGO'}.`);
        ensureNgoNotification(
          getNgoUserId(assignedNgoId || donation.assignedNgo),
          `Your NGO accepted donation "${donation.foodName}".`,
        );
        addAuditLog(assignedNgoId || 'system', 'Donation Accepted', donationId, { assignedNgoName });
      }
      if (status === 'In Distribution') {
        donation.stageTimestamps.inDistributionAt = now;
        donation.verificationStatus = null;
        addNotification(donation.donorId, `Your donation "${donation.foodName}" is in distribution.`);
        ensureNgoNotification(
          getNgoUserId(assignedNgoId || donation.assignedNgo),
          `Donation "${donation.foodName}" is now in distribution.`,
        );
        addAuditLog(assignedNgoId || 'system', 'Donation In Distribution', donationId, {});
      }
      if (status === 'Delivered') {
        donation.stageTimestamps.deliveredAt = now;
        donation.verificationStatus = 'Pending';
        addNotification(donation.donorId, `Distribution proof uploaded for your donation "${donation.foodName}".`);
        ensureNgoNotification(
          getNgoUserId(assignedNgoId || donation.assignedNgo),
          `Distribution proof was submitted for donation "${donation.foodName}" and is awaiting admin verification.`,
        );
        addAuditLog(assignedNgoId || 'system', 'Donation Delivered', donationId, {});
      }
      if (status === 'Verified') {
        donation.stageTimestamps.verifiedAt = now;
        donation.verificationStatus = 'Verified';
        donation.verifiedAt = now;
        addNotification(donation.donorId, `Your donation "${donation.foodName}" has been verified by admin.`);
        addAuditLog(assignedNgoId || 'system', 'Donation Verified', donationId, {});
      }
      setStoredData(STORAGE_KEYS.DONATIONS, donations);
    }
    return donations[idx];
  },

  updateDonation: (donationId, updates) => {
    const donations = getStoredData(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
    const idx = donations.findIndex((d) => d.id === donationId);
    if (idx !== -1) {
      donations[idx] = { ...donations[idx], ...updates };
      setStoredData(STORAGE_KEYS.DONATIONS, donations);
      return donations[idx];
    }
    throw new Error('Donation not found');
  },

  getDistributionReports: () => {
    return getStoredData(STORAGE_KEYS.DISTRIBUTION_REPORTS, INITIAL_DISTRIBUTION_REPORTS);
  },

  getDistributionReportByDonation: (donationId) => {
    const reports = getStoredData(STORAGE_KEYS.DISTRIBUTION_REPORTS, INITIAL_DISTRIBUTION_REPORTS);
    return reports.find((r) => r.donationId === donationId) || null;
  },

  submitDeliveryProof: (donationId, proofData, ngoUser) => {
    const donations = getStoredData(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
    const idx = donations.findIndex((d) => d.id === donationId);
    if (idx === -1) {
      throw new Error('Donation not found');
    }

    if (!proofData.deliveryImages || proofData.deliveryImages.length === 0) {
      throw new Error('Please upload at least one proof image.');
    }
    if (!proofData.distributionLocation || !proofData.distributionDate || !proofData.beneficiariesServed) {
      throw new Error('Please complete all required distribution proof fields.');
    }

    const donation = donations[idx];
    donation.status = 'Delivered';
    donation.deliveryImages = proofData.deliveryImages;
    donation.distributionLocation = proofData.distributionLocation;
    donation.distributionDate = proofData.distributionDate;
    donation.beneficiariesServed = proofData.beneficiariesServed;
    donation.distributionNotes = proofData.distributionNotes || '';
    donation.verificationStatus = 'Pending';
    donation.stageTimestamps.deliveredAt = new Date().toISOString();

    const reports = getStoredData(STORAGE_KEYS.DISTRIBUTION_REPORTS, INITIAL_DISTRIBUTION_REPORTS);
    const ngo = getNgoByUser(ngoUser);
    const newReport = {
      id: `dr_${Date.now()}`,
      donationId: donation.id,
      ngoId: ngo?.id || null,
      ngoName: ngo?.organizationName || ngoUser.name,
      donorId: donation.donorId,
      donorName: donation.donorName,
      foodName: donation.foodName,
      quantity: donation.quantity,
      distributionDate: proofData.distributionDate,
      distributionLocation: proofData.distributionLocation,
      beneficiariesServed: proofData.beneficiariesServed,
      deliveryImages: proofData.deliveryImages,
      notes: proofData.distributionNotes || '',
      status: 'Pending',
      rejectionReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    reports.unshift(newReport);
    setStoredData(STORAGE_KEYS.DISTRIBUTION_REPORTS, reports);
    setStoredData(STORAGE_KEYS.DONATIONS, donations);

    addAuditLog(ngo?.id || ngoUser.id, 'Proof Uploaded', donation.id, { reportId: newReport.id });
    addNotification(donation.donorId, `Your donation "${donation.foodName}" now has distribution proof submitted by ${newReport.ngoName}.`);

    return newReport;
  },

  reviewDistributionReport: (reportId, approved, adminUser, rejectionReason = '') => {
    const reports = getStoredData(STORAGE_KEYS.DISTRIBUTION_REPORTS, INITIAL_DISTRIBUTION_REPORTS);
    const idx = reports.findIndex((r) => r.id === reportId);
    if (idx === -1) {
      throw new Error('Distribution report not found');
    }
    const report = reports[idx];
    const donations = getStoredData(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
    const donationIdx = donations.findIndex((d) => d.id === report.donationId);
    if (donationIdx === -1) {
      throw new Error('Donation not found');
    }
    const donation = donations[donationIdx];
    const ngos = getStoredData(STORAGE_KEYS.NGOS, INITIAL_NGOS);
    const ngo = ngos.find((n) => n.id === report.ngoId);

    if (approved) {
      report.status = 'Approved';
      report.updatedAt = new Date().toISOString();
      donation.status = 'Verified';
      donation.verificationStatus = 'Verified';
      donation.verifiedBy = adminUser.name;
      donation.verifiedAt = new Date().toISOString();
      donation.stageTimestamps.verifiedAt = new Date().toISOString();
      addNotification(donation.donorId, `Admin approved the verification for donation "${donation.foodName}".`);
      if (ngo?.userId) {
        addNotification(ngo.userId, `Admin verified your distribution proof for donation "${donation.foodName}".`);
      }
      if (ngo) updateNgoTrustScore(ngo.id, 2);
      addAuditLog(adminUser.id, 'Admin Approved', donation.id, { reportId });
    } else {
      report.status = 'Rejected';
      report.rejectionReason = rejectionReason;
      report.updatedAt = new Date().toISOString();
      donation.status = 'In Distribution';
      donation.verificationStatus = 'Rejected';
      donation.rejectionReason = rejectionReason;
      addNotification(donation.donorId, `Admin rejected the distribution proof for donation "${donation.foodName}".`);
      if (ngo?.userId) {
        addNotification(ngo.userId, `Admin rejected your distribution proof for donation "${donation.foodName}". Reason: ${rejectionReason}`);
      }
      const previousRejections = reports.filter((r) => r.ngoId === report.ngoId && r.status === 'Rejected').length;
      updateNgoTrustScore(ngo?.id, previousRejections > 1 ? -25 : -10);
      addAuditLog(adminUser.id, 'Admin Rejected', donation.id, { reportId, reason: rejectionReason });
    }

    setStoredData(STORAGE_KEYS.DISTRIBUTION_REPORTS, reports);
    setStoredData(STORAGE_KEYS.DONATIONS, donations);
    return report;
  },

  getNotifications: (userId) => {
    const donations = getStoredData(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
    donations
      .filter((donation) => getNgoUserId(donation.assignedNgo) === userId)
      .forEach((donation) => {
        if (['Accepted by NGO', 'In Distribution', 'Delivered', 'Verified'].includes(donation.status)) {
          const message = donation.status === 'Verified'
            ? `Admin verified your distribution proof for donation "${donation.foodName}".`
            : donation.status === 'Delivered'
              ? `Distribution proof was submitted for donation "${donation.foodName}" and is awaiting admin verification.`
              : donation.status === 'In Distribution'
                ? `Donation "${donation.foodName}" is now in distribution.`
                : `Your NGO accepted donation "${donation.foodName}".`;
          ensureNgoNotification(userId, message);
        }
      });

    const reports = getStoredData(STORAGE_KEYS.DISTRIBUTION_REPORTS, INITIAL_DISTRIBUTION_REPORTS);
    reports
      .filter((report) => getNgoUserId(report.ngoId) === userId && ['Approved', 'Rejected'].includes(report.status))
      .forEach((report) => {
        const message = report.status === 'Approved'
          ? `Admin verified your distribution proof for donation "${report.foodName}".`
          : `Admin rejected your distribution proof for donation "${report.foodName}". Reason: ${report.rejectionReason || 'No reason provided'}`;
        ensureNgoNotification(userId, message);
      });

    const refreshedNotifications = getStoredData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return refreshedNotifications.filter((notif) => notif.userId === userId);
  },

  getAuditLogs: () => {
    return getStoredData(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },

  deleteDonation: (donationId) => {
    let donations = getStoredData(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
    const initialLength = donations.length;
    donations = donations.filter((d) => d.id !== donationId);
    if (donations.length < initialLength) {
      setStoredData(STORAGE_KEYS.DONATIONS, donations);
      return true;
    }
    return false;
  },

  // Food Requests CRUD
  getFoodRequests: () => {
    return getStoredData(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
  },

  createFoodRequest: (requestData, ngoUser) => {
    const requests = getStoredData(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const ngos = getStoredData(STORAGE_KEYS.NGOS, INITIAL_NGOS);
    const ngo = ngos.find((n) => n.userId === ngoUser.id || n.id === ngoUser.id) || {
      organizationName: ngoUser.name,
      id: ngoUser.id,
    };

    const foodCat = requestData.foodCategory || requestData.category || 'Cooked Meals';

    const newRequest = {
      id: `req_${Date.now()}`,
      ngoId: ngo.id,
      ngoName: ngo.organizationName || ngoUser.name,
      foodCategory: foodCat,
      category: foodCat,
      quantityRequired: requestData.quantityRequired,
      urgency: requestData.urgency || 'High',
      requiredBefore: requestData.requiredBefore || new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      reason: requestData.reason || requestData.description || '',
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    requests.unshift(newRequest);
    setStoredData(STORAGE_KEYS.REQUESTS, requests);
    return newRequest;
  },

  cancelFoodRequest: (requestId) => {
    const requests = getStoredData(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const idx = requests.findIndex((r) => r.id === requestId);
    if (idx !== -1) {
      requests[idx].status = 'Cancelled';
      setStoredData(STORAGE_KEYS.REQUESTS, requests);
      return requests[idx];
    }
    return null;
  },

  updateFoodRequestStatus: (requestId, status, ngoUser) => {
    const requests = getStoredData(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);
    const idx = requests.findIndex((r) => r.id === requestId);
    if (idx === -1 || !ngoUser) return null;

    const request = requests[idx];
    const ngos = getStoredData(STORAGE_KEYS.NGOS, INITIAL_NGOS);
    const ngo = ngos.find(
      (item) => item.userId === ngoUser.id || item.id === ngoUser.id || item.contactEmail === ngoUser.email
    );
    const acceptingNgoId = ngo?.id || ngoUser.id;
    const acceptingNgoName = ngo?.organizationName || ngoUser.name;

    if (status === 'Approved') {
      if (request.status !== 'Pending' || request.ngoId === acceptingNgoId) return null;
      request.acceptedByNgoId = acceptingNgoId;
      request.acceptedByNgoName = acceptingNgoName;
    } else if (status === 'Fulfilled') {
      if (request.status !== 'Approved' || request.acceptedByNgoId !== acceptingNgoId) return null;
    } else {
      return null;
    }

    request.status = status;
    setStoredData(STORAGE_KEYS.REQUESTS, requests);
    return request;
  },

  // Intelligent Recommendation Service
  getRecommendationsForDonation: (donationId) => {
    const donations = getStoredData(STORAGE_KEYS.DONATIONS, INITIAL_DONATIONS);
    const donation = donations.find((d) => d.id === donationId);
    if (!donation) return [];

    const ngos = getStoredData(STORAGE_KEYS.NGOS, INITIAL_NGOS);
    const requests = getStoredData(STORAGE_KEYS.REQUESTS, INITIAL_REQUESTS);

    return calculateNgoRecommendations(donation, ngos, requests);
  },
};
