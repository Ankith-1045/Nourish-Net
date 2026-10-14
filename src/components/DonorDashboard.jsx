import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { IconDonor, IconPlus, IconLogout, IconSparkles, IconCheck } from './Icons';

export default function DonorDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [donations, setDonations] = useState([]);
  const [foodRequests, setFoodRequests] = useState([]);
  const [successToast, setSuccessToast] = useState('');
  const [editingDonation, setEditingDonation] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Donate Form State
  const [foodName, setFoodName] = useState('');
  const [category, setCategory] = useState('Cooked Meals');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [preparedAt, setPreparedAt] = useState('');
  const [expiryAt, setExpiryAt] = useState('');
  const [pickupAddress, setPickupAddress] = useState(user.address || '');
  const [contactPhone, setContactPhone] = useState(user.phone || '');
  const [image, setImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadDonations();
    loadNotifications();
  }, [user]);

  const loadDonations = () => {
    const all = api.getDonations();
    const myDonations = all.filter((d) => d.donorId === user.id);
    setDonations(myDonations);
    setFoodRequests(
      api.getFoodRequests().filter((request) => ['Pending', 'Approved'].includes(request.status)),
    );
  };

  const loadNotifications = () => {
    const items = api.getNotifications(user.id);
    setNotifications(items);
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  const getExpiryIndicator = (expiryAt) => {
    if (!expiryAt) return null;
    const exp = new Date(expiryAt);
    const now = new Date();
    const diff = exp - now;
    if (diff < 0) return <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ff4d4f', marginLeft: 'auto' }}>🔴 Expired</span>;
    if (diff <= 24 * 3600 * 1000) return <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#faad14', marginLeft: 'auto' }}>🟠 Expiring Soon</span>;
    return <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#52c41a', marginLeft: 'auto' }}>🟢 Fresh</span>;
  };

  const renderPhotoGallery = (sources, label) => {
    const urls = (Array.isArray(sources) ? sources : String(sources || '').split(','))
      .map((source) => String(source).trim())
      .filter(Boolean);
    if (urls.length === 0) return null;

    return (
      <div style={{ marginTop: '12px' }}>
        <strong>{label}</strong>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
          {urls.map((url, index) => (
            <img key={`${url}-${index}`} src={url} alt={`${label}-${index + 1}`} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6 }} />
          ))}
        </div>
      </div>
    );
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this donation?')) {
      api.deleteDonation(id);
      loadDonations();
      showToast('Donation deleted successfully.');
    }
  };

  const startEdit = (donation) => {
    setEditingDonation(donation);
    setFoodName(donation.foodName);
    setCategory(donation.category);
    setQuantity(donation.quantity);
    setDescription(donation.description);
    setPreparedAt(donation.preparedAt ? donation.preparedAt.substring(0, 16) : '');
    setExpiryAt(donation.expiryAt ? donation.expiryAt.substring(0, 16) : '');
    setPickupAddress(donation.pickupAddress);
    setContactPhone(donation.contactPhone);
    setImage(donation.image || '');
    setActiveTab('donate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingDonation(null);
    setFoodName('');
    setCategory('Cooked Meals');
    setQuantity('');
    setDescription('');
    setPreparedAt('');
    setExpiryAt('');
    setPickupAddress(user.address || '');
    setContactPhone(user.phone || '');
    setImage('');
  };

  const startDonationForRequest = (request) => {
    setEditingDonation(null);
    setFoodName(`${request.foodCategory} for ${request.ngoName}`);
    setCategory(request.foodCategory || 'Cooked Meals');
    setQuantity(String(request.quantityRequired || ''));
    setDescription(request.reason || `Food requested by ${request.ngoName}.`);
    setPreparedAt('');
    setExpiryAt(request.requiredBefore ? request.requiredBefore.substring(0, 16) : '');
    setActiveTab('donate');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDonateSubmit = (e) => {
    e.preventDefault();
    if (!foodName || !quantity || !pickupAddress || !contactPhone) {
      alert('Please complete all required fields (*)');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingDonation) {
        api.updateDonation(editingDonation.id, {
          foodName,
          category,
          quantity,
          description,
          preparedAt: preparedAt ? new Date(preparedAt).toISOString() : editingDonation.preparedAt,
          expiryAt: expiryAt ? new Date(expiryAt).toISOString() : editingDonation.expiryAt,
          pickupAddress,
          contactPhone,
          image,
        });

        loadDonations();
        setIsSubmitting(false);
        cancelEdit();
        showToast('🎉 Donation updated successfully.');
        setActiveTab('myDonations');
      } else {
        api.createDonation(
          {
            foodName,
            category,
            quantity,
            description,
            preparedAt: preparedAt ? new Date(preparedAt).toISOString() : new Date().toISOString(),
            expiryAt: expiryAt ? new Date(expiryAt).toISOString() : new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
            pickupAddress,
            contactPhone,
            image,
          },
          user
        );

        loadDonations();
        setIsSubmitting(false);
        cancelEdit();
        showToast('🎉 Food donation posted successfully! Recommendation engine is matching suitable NGOs.');
        setActiveTab('myDonations');
      }
    } catch (err) {
      alert(err.message || 'Error processing donation');
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="status-badge status-pending">Pending</span>;
      case 'Accepted by NGO':
        return <span className="status-badge status-accepted">Accepted by NGO</span>;
      case 'In Distribution':
        return <span className="status-badge status-collected">In Distribution</span>;
      case 'Delivered':
        return <span className="status-badge status-distributed">Delivered</span>;
      case 'Verified':
        return <span className="status-badge status-approved">Verified</span>;
      case 'Available':
        return <span className="status-badge status-available">Available for Matching</span>;
      case 'NGO Assigned':
        return <span className="status-badge status-assigned">NGO Assigned</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const renderTimeline = (donation) => {
    const steps = [
      { key: 'Pending', label: 'Pending', timestamp: donation.stageTimestamps?.createdAt },
      { key: 'Accepted by NGO', label: 'Accepted by NGO', timestamp: donation.stageTimestamps?.acceptedAt },
      { key: 'In Distribution', label: 'In Distribution', timestamp: donation.stageTimestamps?.inDistributionAt },
      { key: 'Delivered', label: 'Delivered', timestamp: donation.stageTimestamps?.deliveredAt },
      { key: 'Verified', label: 'Verified', timestamp: donation.stageTimestamps?.verifiedAt },
    ];
    const currentIdx = steps.findIndex((step) => step.key === donation.status);

    return (
      <div className="status-timeline">
        {steps.map((step, idx) => {
          const isDone = idx <= currentIdx;
          const isCurrent = idx === currentIdx;
          return (
            <div
              key={step.key}
              className={`timeline-step ${isDone ? 'step-done' : ''} ${isCurrent ? 'step-active' : ''}`}
            >
              <div className="timeline-node">
                {isDone ? <IconCheck size={14} /> : idx + 1}
              </div>
              <div>
                <span className="timeline-label">{step.label}</span>
                {step.timestamp && <div className="timeline-time">{new Date(step.timestamp).toLocaleString()}</div>}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const _now = new Date();
  const expiringCount = donations.filter((d) => {
    if (d.status !== 'Pending' || !d.expiryAt) return false;
    const exp = new Date(d.expiryAt);
    return exp > _now && exp <= new Date(_now.getTime() + 24 * 3600 * 1000);
  }).length;

  return (
    <div className="dashboard-container">
      {/* Toast Notification */}
      {successToast && <div className="toast-notification">{successToast}</div>}

      {/* Top Header */}
      <header className="dashboard-header">
        <div className="header-brand">
          <IconDonor size={24} />
          <div>
            <h1 className="header-title">Donor Dashboard</h1>
            <span className="header-welcome">Welcome back, {user.name}</span>
          </div>
        </div>

        <div className="header-actions">
          <span className="user-role-tag">DONOR</span>
          <button className="button button--secondary logout-btn" onClick={onLogout}>
            <IconLogout size={16} /> Log Out
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'donate' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('donate')}
        >
          <IconPlus size={16} /> Donate Food
        </button>
        <button
          className={`tab-btn ${activeTab === 'requests' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          NGO Requests ({foodRequests.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'myDonations' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('myDonations')}
        >
          My Donations ({donations.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'status' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('status')}
        >
          Donation Status
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Donation History
        </button>
        <button
          className={`tab-btn ${activeTab === 'notifications' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          Notifications
        </button>
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="tab-pane">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Total Donations Posted</span>
                <span className="stat-value">{donations.length}</span>
                <span className="stat-meta">Surplus contributions</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Active / In Transit</span>
                <span className="stat-value">
                  {donations.filter((d) => ['Pending', 'Accepted by NGO', 'In Distribution'].includes(d.status)).length}
                </span>
                <span className="stat-meta">Currently being processed</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Delivered / Verified</span>
                <span className="stat-value">
                  {donations.filter((d) => ['Delivered', 'Verified'].includes(d.status)).length}
                </span>
                <span className="stat-meta">Proof submitted or approved</span>
              </div>

              <div className="stat-card">
                <span className="stat-label">Expiring Soon</span>
                <span className="stat-value">{expiringCount}</span>
                <span className="stat-meta">{expiringCount === 0 ? 'No items expiring soon' : 'Items expiring < 24 hrs'}</span>
              </div>

              <div className="stat-card highlight-card">
                <span className="stat-label">Community Impact Score</span>
                <span className="stat-value">
                  <IconSparkles size={22} /> 98 / 100
                </span>
                <span className="stat-meta">Top 5% Gold Donor Tier</span>
              </div>
            </div>

            <div className="dashboard-section-header">
              <h2>Recent Food Contributions</h2>
              <button className="button button--primary" onClick={() => setActiveTab('donate')}>
                + Donate Surplus Food
              </button>
            </div>

            <div className="donations-grid">
              {donations.length === 0 ? (
                <div className="empty-state">
                  <h3>No donations posted yet</h3>
                  <p>You haven't posted any food surplus items yet. Click below to start!</p>
                  <button className="button button--primary" onClick={() => setActiveTab('donate')}>
                    Post First Donation
                  </button>
                </div>
              ) : (
                donations.slice(0, 3).map((item) => (
                  <div key={item.id} className="donation-card">
                    {item.image && (
                      <div className="card-image-wrapper">
                        <img src={item.image} alt={item.foodName} className="card-img" />
                      </div>
                    )}
                    <div className="card-body">
                      <div className="card-header-line">
                        <span className="category-pill">{item.category}</span>
                        {getStatusBadge(item.status)}
                        {getExpiryIndicator(item.expiryAt)}
                      </div>
                      <h3 className="card-title">{item.foodName}</h3>
                      <p className="card-qty">Quantity: <strong>{item.quantity}</strong></p>
                      <p className="card-desc">{item.description}</p>
                      <div className="card-footer-info">
                        <span>Pickup: {item.pickupAddress}</span>
                        {item.assignedNgoName && (
                          <span className="assigned-info">Assigned to: <strong>{item.assignedNgoName}</strong></span>
                        )}
                      </div>
                      {renderPhotoGallery(item.deliveryImages, 'Distribution Proof Photos')}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', borderTop: '1px solid #333', paddingTop: '12px' }}>
                        {item.status === 'Pending' ? (
                          <>
                            <button className="button button--secondary btn-sm" style={{ flex: 1 }} onClick={() => startEdit(item)}>Edit</button>
                            <button className="button button--secondary btn-sm" style={{ flex: 1, color: '#ff4d4f', borderColor: '#ff4d4f' }} onClick={() => handleDelete(item.id)}>Delete</button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>This donation is already being processed and can no longer be modified.</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* DONATE FOOD TAB */}
        {activeTab === 'donate' && (
          <div className="tab-pane">
            <div className="form-container-card">
              <h2 className="form-title">{editingDonation ? 'Edit Surplus Food Donation' : 'Post Surplus Food Donation'}</h2>
              <p className="form-subtitle">
                {editingDonation
                  ? 'Modify the details of your active surplus food donation below.'
                  : 'Provide accurate details about your surplus food so our Intelligent Allocation Engine can score and route it to the optimal local NGO.'}
              </p>

              <form onSubmit={handleDonateSubmit} className="donate-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Food Item / Dish Name *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 50 Gourmet Rice Bowls & Vegetable Curry"
                      value={foodName}
                      onChange={(e) => setFoodName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Food Category *</label>
                    <select
                      className="form-input"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="Cooked Meals">Cooked Meals</option>
                      <option value="Packaged Food">Packaged Food</option>
                      <option value="Fresh Produce">Fresh Produce</option>
                      <option value="Bakery">Bakery & Pastries</option>
                      <option value="Beverages">Beverages & Juices</option>
                      <option value="Grocery">Bulk Grocery</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Quantity * (e.g. 50 meals / 20 kg)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 50 meals or 30 kg"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Optional Food Image URL</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://..."
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Food Description & Preparation Notes</label>
                  <textarea
                    className="form-input form-textarea"
                    rows="3"
                    placeholder="Describe packaging, dietary details (veg/non-veg), storage instructions..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Preparation Date & Time</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={preparedAt}
                      onChange={(e) => setPreparedAt(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Expiry Date & Time (Crucial for recommendation urgency)</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={expiryAt}
                      onChange={(e) => setExpiryAt(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Pickup Address *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Contact Phone Number *</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button type="submit" className="button button--primary submit-btn" disabled={isSubmitting} style={{ flex: 1 }}>
                    {isSubmitting ? 'Saving...' : editingDonation ? 'Update Donation →' : 'Submit Food Donation →'}
                  </button>
                  {editingDonation && (
                    <button type="button" className="button button--secondary" onClick={cancelEdit}>
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* NGO REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="tab-pane">
            <h2 className="section-heading">Food Requests from NGOs</h2>
            <div className="donations-grid">
              {foodRequests.length === 0 ? (
                <div className="empty-state">
                  <h3>No active NGO requests</h3>
                  <p>New food requirements posted by NGOs will appear here.</p>
                </div>
              ) : (
                foodRequests.map((request) => (
                  <div key={request.id} className="donation-card">
                    <div className="card-body">
                      <div className="card-header-line">
                        <span className="category-pill">{request.foodCategory}</span>
                        {getStatusBadge(request.status)}
                      </div>
                      <h3 className="card-title">{request.ngoName}</h3>
                      <p className="card-qty">
                        Requested quantity: <strong>{request.quantityRequired}</strong>
                      </p>
                      <p className="card-desc">{request.reason || 'Food donation requested by this NGO.'}</p>
                      <div className="card-footer-info">
                        <span>Needed by: {new Date(request.requiredBefore).toLocaleString()}</span>
                        <span>Urgency: {request.urgency}</span>
                      </div>
                      <button
                        className="button button--primary"
                        style={{ width: '100%', marginTop: '12px' }}
                        onClick={() => startDonationForRequest(request)}
                      >
                        Donate for This Request
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* MY DONATIONS TAB */}
        {activeTab === 'myDonations' && (
          <div className="tab-pane">
            <h2 className="section-heading">My Active & Recent Food Donations</h2>
            <div className="donations-grid">
              {donations.length === 0 ? (
                <p>No donations found.</p>
              ) : (
                donations.map((item) => (
                  <div key={item.id} className="donation-card">
                    {item.image && (
                      <div className="card-image-wrapper">
                        <img src={item.image} alt={item.foodName} className="card-img" />
                      </div>
                    )}
                    <div className="card-body">
                      <div className="card-header-line">
                        <span className="category-pill">{item.category}</span>
                        {getStatusBadge(item.status)}
                      </div>
                      <h3 className="card-title">{item.foodName}</h3>
                      <p className="card-qty">Quantity: <strong>{item.quantity}</strong></p>
                      <p className="card-desc">{item.description}</p>
                      <div className="card-footer-info">
                        <span>Pickup: {item.pickupAddress}</span>
                        <span>Contact: {item.contactPhone}</span>
                      </div>
                      {renderPhotoGallery(item.deliveryImages, 'Distribution Proof Photos')}
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                        {item.status === 'Pending' ? (
                          <>
                            <button className="button button--secondary btn-sm" style={{ flex: 1 }} onClick={() => startEdit(item)}>Edit</button>
                            <button className="button button--secondary btn-sm" style={{ flex: 1, color: '#ff4d4f', borderColor: '#ff4d4f' }} onClick={() => handleDelete(item.id)}>Delete</button>
                          </>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#888', fontStyle: 'italic' }}>This donation is being processed and cannot be modified.</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* DONATION STATUS TAB */}
        {activeTab === 'status' && (
          <div className="tab-pane">
            <h2 className="section-heading">Live Donation Pipeline & Timeline</h2>
            <div className="status-list">
              {donations.map((item) => (
                <div key={item.id} className="status-tracker-card">
                  <div className="tracker-card-header">
                    <div>
                      <h3>{item.foodName}</h3>
                      <span className="tracker-sub">Quantity: {item.quantity} • Category: {item.category}</span>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                  {renderTimeline(item)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="tab-pane">
            <h2 className="section-heading">Completed Distribution History</h2>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Food Name</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Assigned NGO</th>
                    <th>Date Posted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((item) => (
                    <tr key={item.id}>
                      <td><strong>{item.foodName}</strong></td>
                      <td>{item.category}</td>
                      <td>{item.quantity}</td>
                      <td>{item.assignedNgoName || 'Pending Assignment'}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>{getStatusBadge(item.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="tab-pane">
            <h2 className="section-heading">Notifications & Updates</h2>
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="empty-state">
                  <p>No notifications yet.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="notification-card">
                    <div className="notif-icon">🔔</div>
                    <div className="notif-content">
                      <p>{notif.message}</p>
                      <span className="notif-time">{new Date(notif.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="tab-pane">
            <div className="profile-card">
              <h2>Donor Organization Profile</h2>
              <div className="profile-details">
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role.toUpperCase()}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Pickup Address:</strong> {user.address}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
