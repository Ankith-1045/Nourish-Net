import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { IconNGO, IconLogout } from './Icons';

export default function NgoDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [donations, setDonations] = useState([]);
  const [foodRequests, setFoodRequests] = useState([]);
  const [ngoProfile, setNgoProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  // Food Request Management State
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);
  const [proofModalDonation, setProofModalDonation] = useState(null);
  const [proofDistributionLocation, setProofDistributionLocation] = useState('');
  const [proofDistributionDate, setProofDistributionDate] = useState('');
  const [proofBeneficiariesServed, setProofBeneficiariesServed] = useState('');
  const [proofDeliveryImages, setProofDeliveryImages] = useState('');
  const [proofDistributionNotes, setProofDistributionNotes] = useState('');
  const [proofSubmitting, setProofSubmitting] = useState(false);

  // Food Request Form Inputs
  const [reqCategory, setReqCategory] = useState('Cooked Meals');
  const [reqQty, setReqQty] = useState('');
  const [reqUrgency, setReqUrgency] = useState('High');
  const [reqRequiredBefore, setReqRequiredBefore] = useState('');
  const [reqReason, setReqReason] = useState('');

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    const refreshNotifications = () => {
      setNotifications(api.getNotifications(user.id));
    };
    const intervalId = setInterval(refreshNotifications, 3000);
    return () => clearInterval(intervalId);
  }, [user]);

  const loadData = () => {
    api.checkPendingDonationNotifications();
    const allDonations = api.getDonations();
    setDonations(allDonations);

    const ngos = api.getNgos();
    const ngo = ngos.find((n) => n.userId === user.id || n.contactEmail === user.email);
    setNgoProfile(ngo || null);

    const allRequests = api.getFoodRequests();
    setFoodRequests(allRequests.filter((req) => ['Pending', 'Approved', 'Fulfilled'].includes(req.status)));

    const userNotifications = api.getNotifications(user.id);
    setNotifications(userNotifications);
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleAcceptDonation = (donationId) => {
    const ngoName = ngoProfile ? ngoProfile.organizationName : user.name;
    const ngoId = ngoProfile ? ngoProfile.id : user.id;

    api.updateDonationStatus(donationId, 'Accepted by NGO', ngoId, ngoName);
    loadData();
    showToast('🎉 Donation accepted! You can now move it into distribution.');
  };

  const handleRejectDonation = (donationId) => {
    api.updateDonationStatus(donationId, 'Rejected by NGO');
    loadData();
    showToast('❌ Donation rejected. Donor has been notified.');
  };

  const handleUpdateStatus = (donationId, nextStatus) => {
    api.updateDonationStatus(donationId, nextStatus);
    loadData();
    showToast(`Status updated to "${nextStatus}".`);
  };

  const openProofModal = (donation) => {
    setProofModalDonation(donation);
    setProofDistributionLocation(donation.distributionLocation || donation.pickupAddress || '');
    setProofDistributionDate(new Date().toISOString().slice(0, 16));
    setProofBeneficiariesServed(donation.beneficiariesServed || '');
    setProofDeliveryImages(donation.image ? `${donation.image}` : '');
    setProofDistributionNotes(donation.distributionNotes || '');
  };

  const closeProofModal = () => {
    setProofModalDonation(null);
    setProofDistributionLocation('');
    setProofDistributionDate('');
    setProofBeneficiariesServed('');
    setProofDeliveryImages('');
    setProofDistributionNotes('');
    setProofSubmitting(false);
  };

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!proofModalDonation) return;

    if (!proofDistributionLocation || !proofDistributionDate || !proofBeneficiariesServed || !proofDeliveryImages) {
      alert('Please complete all required distribution proof fields and provide proof image URLs.');
      return;
    }

    setProofSubmitting(true);
    try {
      const proofData = {
        distributionLocation: proofDistributionLocation,
        distributionDate: proofDistributionDate,
        beneficiariesServed: proofBeneficiariesServed,
        distributionNotes: proofDistributionNotes,
        deliveryImages: proofDeliveryImages.split(',').map((url) => url.trim()).filter(Boolean),
      };

      api.submitDeliveryProof(proofModalDonation.id, proofData, user);
      loadData();
      closeProofModal();
      showToast('✅ Distribution proof submitted and awaiting admin verification.');
    } catch (err) {
      alert(err.message || 'Failed to submit delivery proof.');
      setProofSubmitting(false);
    }
  };

  const handleCreateRequest = (e) => {
    e.preventDefault();
    if (!reqQty) {
      alert('Please specify required quantity.');
      return;
    }

    api.createFoodRequest(
      {
        foodCategory: reqCategory,
        category: reqCategory,
        quantityRequired: reqQty,
        urgency: reqUrgency,
        requiredBefore: reqRequiredBefore ? new Date(reqRequiredBefore).toISOString() : new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
        reason: reqReason,
      },
      user
    );

    loadData();
    setReqQty('');
    setReqReason('');
    setReqRequiredBefore('');
    setShowRequestForm(false);
    showToast('🚀 Food requirement request submitted successfully!');
    setActiveTab('requests');
  };

  const handleAcceptRequest = (requestId) => {
    const updatedRequest = api.updateFoodRequestStatus(requestId, 'Approved', user);
    if (!updatedRequest) return;
    loadData();
    showToast('✅ Food request accepted.');
  };

  const handleFulfillRequest = (requestId) => {
    const updatedRequest = api.updateFoodRequestStatus(requestId, 'Fulfilled', user);
    if (!updatedRequest) return;
    loadData();
    showToast('✅ Food request marked as fulfilled.');
  };

  const handleCancelRequest = (requestId) => {
    if (window.confirm('Are you sure you want to cancel this food request?')) {
      api.cancelFoodRequest(requestId);
      loadData();
      showToast('Food request has been cancelled.');
    }
  };

  const canManageRequest = (request) => {
    const requestOwnerId = ngoProfile ? ngoProfile.id : user.id;
    const requestOwnerName = ngoProfile ? ngoProfile.organizationName : user.name;
    return request.ngoId === requestOwnerId || request.ngoName === requestOwnerName;
  };

  const acceptedByCurrentNgo = (request) => {
    const currentNgoId = ngoProfile ? ngoProfile.id : user.id;
    return request.acceptedByNgoId === currentNgoId;
  };

  const otherNgosFoodRequests = foodRequests.filter((request) => !canManageRequest(request));

  const getRequestStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <span className="status-badge status-pending">Pending</span>;
      case 'Approved':
        return <span className="status-badge status-approved">Approved</span>;
      case 'Fulfilled':
        return <span className="status-badge status-distributed">Fulfilled ✓</span>;
      case 'Cancelled':
        return <span className="status-badge status-rejected">Cancelled</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  const myAcceptedDonations = donations.filter(
    (d) =>
      (d.assignedNgo === (ngoProfile?.id || user.id) ||
        d.assignedNgoName === (ngoProfile?.organizationName || user.name)) &&
      ['Accepted by NGO', 'In Distribution', 'Delivered', 'Verified', 'Rejected', 'NGO Assigned'].includes(d.status)
  );

  const availableDonations = donations.filter(
    (d) => ['Available', 'Pending'].includes(d.status) && !d.assignedNgo
  );

  return (
    <div className="dashboard-container">
      {toastMsg && <div className="toast-notification">{toastMsg}</div>}

      <header className="dashboard-header">
        <div className="header-brand">
          <IconNGO size={24} />
          <div>
            <h1 className="header-title">NGO Dashboard</h1>
            <span className="header-welcome">
              {ngoProfile ? ngoProfile.organizationName : user.name}
            </span>
          </div>
        </div>

        <div className="header-actions">
          <span className="user-role-tag ngo-role-tag">NGO / CHARITY</span>
          <button className="button button--secondary logout-btn" onClick={onLogout}>
            <IconLogout size={16} /> Log Out
          </button>
        </div>
      </header>

      <nav className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'available' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('available')}
        >
          Available Donations ({availableDonations.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'accepted' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('accepted')}
        >
          Accepted ({myAcceptedDonations.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'requests' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Food Requests ({otherNgosFoodRequests.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'inventory' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Inventory
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Distribution History
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
          Profile & Capacity
        </button>
      </nav>

      <main  className="dashboard-content">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="tab-pane">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Available Donations</span>
                <span className="stat-value">{availableDonations.length}</span>
                <span className="stat-meta">Surplus ready for claiming</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Claimed / Accepted</span>
                <span className="stat-value">{myAcceptedDonations.length}</span>
                <span className="stat-meta">In distribution process</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Active Need Requests</span>
                <span className="stat-value">{otherNgosFoodRequests.length}</span>
                <span className="stat-meta">Urgent community needs</span>
              </div>
              <div className="stat-card highlight-card">
                <span className="stat-label">Daily Capacity</span>
                <span className="stat-value">{ngoProfile?.capacity || '150 meals/day'}</span>
                <span className="stat-meta">Verified Shelter Capacity</span>
              </div>
            </div>

            <div className="dashboard-section-header">
              <h2>Top Recommended Donations For You</h2>
              <button
                className="button button--primary"
                onClick={() => {
                  setActiveTab('requests');
                  setShowRequestForm(true);
                }}
              >
                + Submit Food Need Request
              </button>
            </div>

            <div className="donations-grid">
              {availableDonations.length === 0 ? (
                <div className="empty-state">
                  <p>No unassigned donations currently available.</p>
                </div>
              ) : (
                availableDonations.slice(0, 3).map((item) => (
                  <div key={item.id} className="donation-card">
                    {item.image && (
                      <div className="card-image-wrapper">
                        <img src={item.image} alt={item.foodName} className="card-img" />
                      </div>
                    )}
                    <div className="card-body">
                      <div className="card-header-line">
                        <span className="category-pill">{item.category}</span>
                        <span className="status-badge status-available">Available</span>
                      </div>
                      <h3 className="card-title">{item.foodName}</h3>
                      <p className="card-qty">Quantity: <strong>{item.quantity}</strong></p>
                      <p className="card-desc">{item.description}</p>
                      <p className="card-donor">Donor: {item.donorName}</p>
                      <button
                        className="button button--primary action-btn-full"
                        onClick={() => handleAcceptDonation(item.id)}
                      >
                        Accept Surplus Donation →
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* AVAILABLE DONATIONS TAB */}
        {activeTab === 'available' && (
          <div className="tab-pane">
            <h2 className="section-heading">Browse Available Food Surplus</h2>
            <div className="donations-grid">
              {availableDonations.map((item) => (
                <div key={item.id} className="donation-card">
                  {item.image && (
                    <div className="card-image-wrapper">
                      <img src={item.image} alt={item.foodName} className="card-img" />
                    </div>
                  )}
                  <div className="card-body">
                    <div className="card-header-line">
                      <span className="category-pill">{item.category}</span>
                      <span className={`status-badge ${item.status === 'Pending' ? 'status-pending' : 'status-available'}`}>
                        {item.status}
                      </span>
                    </div>
                    <h3 className="card-title">{item.foodName}</h3>
                    <p className="card-qty">Quantity: <strong>{item.quantity}</strong></p>
                    <p className="card-desc">{item.description}</p>
                    <div className="card-footer-info">
                      <span>Pickup: {item.pickupAddress}</span>
                      <span>Contact: {item.contactPhone}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        className="button button--primary action-btn-full"
                        onClick={() => handleAcceptDonation(item.id)}
                      >
                        Accept Donation →
                      </button>
                      {item.status === 'Pending' && (
                        <button
                          className="button button--reject action-btn-full"
                          onClick={() => handleRejectDonation(item.id)}
                          style={{ flex: 1, minWidth: '140px' }}
                        >
                          Reject Donation
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACCEPTED DONATIONS TAB */}
        {activeTab === 'accepted' && (
          <div className="tab-pane">
            <h2 className="section-heading">Your Claimed & In-Progress Food Shipments</h2>
            <div className="donations-grid">
              {myAcceptedDonations.length === 0 ? (
                <div className="empty-state">
                  <p>No claimed donations are currently in progress.</p>
                </div>
              ) : (
                myAcceptedDonations.map((item) => (
                  <div key={item.id} className="donation-card">
                    {item.image && (
                      <div className="card-image-wrapper">
                        <img src={item.image} alt={item.foodName} className="card-img" />
                      </div>
                    )}
                    <div className="card-body">
                      <div className="card-header-line">
                        <span className="category-pill">{item.category}</span>
                        <span className="status-badge status-accepted">{item.status}</span>
                      </div>
                      <h3 className="card-title">{item.foodName}</h3>
                      <p className="card-qty">Quantity: <strong>{item.quantity}</strong></p>
                      <p className="card-desc">Pickup: {item.pickupAddress} ({item.contactPhone})</p>
                      {item.distributionLocation && (
                        <p className="card-desc">Distribution Location: {item.distributionLocation}</p>
                      )}
                      {item.distributionDate && (
                        <p className="card-desc">Distribution Date: {new Date(item.distributionDate).toLocaleString()}</p>
                      )}
                      {item.rejectionReason && (
                        <p className="card-desc" style={{ color: '#ffb347' }}>
                          Rejection Note: {item.rejectionReason}
                        </p>
                      )}

                      <div className="ngo-status-actions" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '16px' }}>
                        {['Accepted by NGO', 'NGO Assigned'].includes(item.status) && (
                          <>
                            <button
                              className="button button--secondary btn-sm"
                              onClick={() => handleUpdateStatus(item.id, 'In Distribution')}
                            >
                              Mark as In Distribution
                            </button>
                            <button
                              className="button button--reject btn-sm"
                              onClick={() => handleRejectDonation(item.id)}
                            >
                              Reject Donation
                            </button>
                          </>
                        )}

                        {item.status === 'In Distribution' && (
                          <button
                            className="button button--primary btn-sm"
                            onClick={() => openProofModal(item)}
                          >
                            Submit Distribution Proof
                          </button>
                        )}

                        {item.status === 'Delivered' && (
                          <span className="status-badge status-pending" style={{ marginTop: '6px' }}>
                            Proof submitted - awaiting admin verification
                          </span>
                        )}

                        {item.status === 'Verified' && (
                          <span className="status-badge status-approved" style={{ marginTop: '6px' }}>
                            Verified by admin
                          </span>
                        )}

                        {item.status === 'Rejected' && (
                          <button
                            className="button button--primary btn-sm"
                            onClick={() => openProofModal(item)}
                          >
                            Resubmit Proof
                          </button>
                        )}
                      </div>
                      {/* Donor provided photos */}
                      {item.image && (
                        <div style={{ marginTop: 12 }}>
                          <strong>Donor Photos:</strong>
                          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                            {String(item.image)
                              .split(',')
                              .map((src) => src.trim())
                              .filter(Boolean)
                              .map((src, i) => (
                                <img key={i} src={src} alt={`donor-${i}`} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Distribution proof photos */}
                      {item.deliveryImages && item.deliveryImages.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <strong>Proof Photos:</strong>
                          <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                            {item.deliveryImages.map((src, i) => (
                              <img key={i} src={src} alt={`proof-${i}`} style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {proofModalDonation && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.8)',
              zIndex: 3000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px',
            }}
            onClick={closeProofModal}
          >
            <div
              className="form-container-card distribution-proof-modal"
              style={{ maxWidth: '720px', width: '100%', position: 'relative' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ margin: 0 }}>Submit Distribution Proof</h3>
                  <p style={{ margin: '6px 0 0' }}>
                    Upload evidence for <strong>{proofModalDonation.foodName}</strong>.
                  </p>
                </div>
                <button className="button button--secondary" onClick={closeProofModal}>
                  Close
                </button>
              </div>

              <form onSubmit={handleSubmitProof} className="donate-form">
                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Distribution Location *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={proofDistributionLocation}
                      onChange={(e) => setProofDistributionLocation(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Distribution Date *</label>
                    <input
                      type="datetime-local"
                      className="form-input"
                      value={proofDistributionDate}
                      onChange={(e) => setProofDistributionDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Beneficiaries Served *</label>
                    <input
                      type="text"
                      className="form-input"
                      value={proofBeneficiariesServed}
                      onChange={(e) => setProofBeneficiariesServed(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label>Proof Image URLs *</label>
                    <textarea
                      className="form-input form-textarea"
                      rows="3"
                      placeholder="Enter one or more image URLs separated by commas"
                      value={proofDeliveryImages}
                      onChange={(e) => setProofDeliveryImages(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes (optional)</label>
                  <textarea
                    className="form-input form-textarea"
                    rows="3"
                    placeholder="Describe the delivery, beneficiary details, or proof context..."
                    value={proofDistributionNotes}
                    onChange={(e) => setProofDistributionNotes(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '16px', justifyContent: 'flex-end' }}>
                  <button type="button" className="button button--secondary" onClick={closeProofModal}>
                    Cancel
                  </button>
                  <button type="submit" className="button button--primary" disabled={proofSubmitting}>
                    {proofSubmitting ? 'Submitting...' : 'Submit Proof & Request Verification'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* FOOD REQUESTS TAB */}
        {activeTab === 'requests' && (
          <div className="tab-pane">
            <div className="dashboard-section-header" style={{ marginBottom: '24px' }}>
              <h2 className="section-heading" style={{ margin: 0 }}>Food Requests</h2>
              <button
                className="button button--primary"
                onClick={() => setShowRequestForm(!showRequestForm)}
              >
                {showRequestForm ? '✕ Close Form' : '+ Submit Food Need Request'}
              </button>
            </div>

            {showRequestForm && (
              <div className="form-container-card" style={{ marginBottom: '32px' }}>
                <h3 className="form-title">Submit Food Need Request</h3>
                <p className="form-subtitle">Fill in the details for your food requirement.</p>

                <form onSubmit={handleCreateRequest} className="donate-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Food Required *</label>
                      <select
                        className="form-input"
                        value={reqCategory}
                        onChange={(e) => setReqCategory(e.target.value)}
                      >
                        <option value="Cooked Meals">Cooked Meals</option>
                        <option value="Packaged Food">Packaged Food</option>
                        <option value="Fresh Produce">Fresh Produce</option>
                        <option value="Bakery">Bakery</option>
                        <option value="Beverages">Beverages</option>
                        <option value="Grocery">Bulk Grocery</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Quantity Needed * (e.g. 100 meals / 50 kg)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. 80 meals"
                        value={reqQty}
                        onChange={(e) => setReqQty(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Urgency Level *</label>
                      <select
                        className="form-input"
                        value={reqUrgency}
                        onChange={(e) => setReqUrgency(e.target.value)}
                      >
                        <option value="High">High (Needed within 12 hours)</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Required Before (Date & Time)</label>
                      <input
                        type="datetime-local"
                        className="form-input"
                        value={reqRequiredBefore}
                        onChange={(e) => setReqRequiredBefore(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Reason / Description</label>
                    <textarea
                      className="form-input form-textarea"
                      rows="3"
                      placeholder="Describe the target shelter, beneficiaries, or reason for this request..."
                      value={reqReason}
                      onChange={(e) => setReqReason(e.target.value)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                    <button type="submit" className="button button--primary submit-btn" style={{ flex: 1 }}>
                      Submit Request →
                    </button>
                    <button
                      type="button"
                      className="button button--secondary"
                      onClick={() => setShowRequestForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="donations-grid">
              {otherNgosFoodRequests.length === 0 ? (
                <div className="empty-state">
                  <p>No food requests from other NGOs yet.</p>
                </div>
              ) : (
                otherNgosFoodRequests.map((req) => (
                  <div key={req.id} className="donation-card">
                    <div className="card-body">
                      <div className="card-header-line">
                        <span className="category-pill">{req.foodCategory || req.category}</span>
                        {getRequestStatusBadge(req.status)}
                      </div>
                      <h3 className="card-title" style={{ marginTop: '8px' }}>
                        Food Required: {req.foodCategory || req.category}
                      </h3>
                      <p className="card-qty">
                        Quantity Needed: <strong>{req.quantityRequired}</strong>
                      </p>
                      <p className="card-desc">
                        <strong>Urgency Level:</strong> {req.urgency}
                      </p>
                      <p className="card-desc">
                        <strong>Required Before:</strong>{' '}
                        {req.requiredBefore
                          ? new Date(req.requiredBefore).toLocaleString([], {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : 'N/A'}
                      </p>
                      <p className="card-desc" style={{ marginTop: '4px' }}>
                        <strong>Reason / Description:</strong> {req.reason || req.description || 'N/A'}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          gap: '8px',
                          marginTop: '16px',
                          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                          paddingTop: '12px',
                        }}
                      >
                        <button
                          className="button button--secondary btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => setSelectedRequestDetails(req)}
                        >
                          View Details
                        </button>
                        {!canManageRequest(req) && req.status === 'Pending' && (
                          <button
                            className="button button--primary btn-sm"
                            style={{ flex: 1 }}
                            onClick={() => handleAcceptRequest(req.id)}
                          >
                            Accept Request
                          </button>
                        )}
                        {req.status === 'Approved' && acceptedByCurrentNgo(req) && (
                          <button
                            className="button button--primary btn-sm"
                            style={{ flex: 1 }}
                            onClick={() => handleFulfillRequest(req.id)}
                          >
                            Mark as Fulfilled
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* View Details Modal */}
            {selectedRequestDetails && (
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.8)',
                  zIndex: 3000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px',
                }}
                onClick={() => setSelectedRequestDetails(null)}
              >
                <div
                  className="form-container-card"
                  style={{ maxWidth: '550px', width: '100%', position: 'relative' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                      paddingBottom: '12px',
                    }}
                  >
                    <h3 style={{ margin: 0 }}>Request Details</h3>
                    {getRequestStatusBadge(selectedRequestDetails.status)}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                    <p>
                      <strong>Organization / NGO:</strong> {selectedRequestDetails.ngoName}
                    </p>
                    <p>
                      <strong>Food Required:</strong>{' '}
                      {selectedRequestDetails.foodCategory || selectedRequestDetails.category}
                    </p>
                    <p>
                      <strong>Quantity Needed:</strong> {selectedRequestDetails.quantityRequired}
                    </p>
                    <p>
                      <strong>Urgency Level:</strong> {selectedRequestDetails.urgency}
                    </p>
                    <p>
                      <strong>Required Before:</strong>{' '}
                      {selectedRequestDetails.requiredBefore
                        ? new Date(selectedRequestDetails.requiredBefore).toLocaleString()
                        : 'N/A'}
                    </p>
                    <p>
                      <strong>Reason / Description:</strong>{' '}
                      {selectedRequestDetails.reason || selectedRequestDetails.description || 'N/A'}
                    </p>
                    <p>
                      <strong>Current Status:</strong> {selectedRequestDetails.status}
                    </p>
                    <p>
                      <strong>Submitted Date:</strong>{' '}
                      {selectedRequestDetails.createdAt
                        ? new Date(selectedRequestDetails.createdAt).toLocaleString()
                        : 'N/A'}
                    </p>
                  </div>

                  <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    {selectedRequestDetails.status === 'Pending' && (
                      <button
                        className="button button--primary"
                        onClick={() => {
                          handleAcceptRequest(selectedRequestDetails.id);
                          setSelectedRequestDetails(null);
                        }}
                      >
                        Accept Request
                      </button>
                    )}
                    {selectedRequestDetails.status === 'Approved' && (
                      <button
                        className="button button--primary"
                        onClick={() => {
                          handleFulfillRequest(selectedRequestDetails.id);
                          setSelectedRequestDetails(null);
                        }}
                      >
                        Mark as Fulfilled
                      </button>
                    )}
                    {(selectedRequestDetails.status === 'Pending' || selectedRequestDetails.status === 'Approved') && (
                      <button
                        className="button button--secondary"
                        style={{ color: '#ff4d4f', borderColor: '#ff4d4f' }}
                        onClick={() => {
                          handleCancelRequest(selectedRequestDetails.id);
                          setSelectedRequestDetails(null);
                        }}
                      >
                        Cancel Request
                      </button>
                    )}
                    <button
                      className="button button--primary"
                      onClick={() => setSelectedRequestDetails(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === 'inventory' && (
          <div className="tab-pane">
            <h2 className="section-heading">Current NGO Food Inventory</h2>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Food Item</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myAcceptedDonations.map((item) => (
                    <tr key={item.id}>
                      <td>{item.foodName}</td>
                      <td>{item.category}</td>
                      <td>{item.quantity}</td>
                      <td><span className="status-badge status-accepted">{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DISTRIBUTION HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="tab-pane">
            <h2 className="section-heading">Completed Distribution Log</h2>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Food Item</th>
                    <th>Category</th>
                    <th>Quantity</th>
                    <th>Donor Source</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {myAcceptedDonations
                    .filter((d) => ['Delivered', 'Verified', 'Rejected'].includes(d.status))
                    .map((item) => (
                      <tr key={item.id}>
                        <td>{item.foodName}</td>
                        <td>{item.category}</td>
                        <td>{item.quantity}</td>
                        <td>{item.donorName}</td>
                        <td>
                          <span className={`status-badge ${
                            item.status === 'Verified'
                              ? 'status-approved'
                              : item.status === 'Rejected'
                              ? 'status-rejected'
                              : 'status-distributed'
                          }`}>
                            {item.status}
                          </span>
                        </td>
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
            <h2 className="section-heading">NGO Alerts & Messages</h2>
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="notification-card">
                  <div className="notif-icon">🛈</div>
                  <div className="notif-content">
                    <p>No notifications yet. Actions like donation acceptance, delivery proof, and admin updates will appear here.</p>
                    <span className="notif-time">{new Date().toLocaleDateString()}</span>
                  </div>
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
              <h2>NGO Organization Profile & Capacity</h2>
              {ngoProfile && (
                <div className="profile-details">
                  <p><strong>Organization Name:</strong> {ngoProfile.organizationName}</p>
                  <p><strong>Registration Number:</strong> {ngoProfile.registrationNumber}</p>
                  <p><strong>Approval Status:</strong> <span className="status-badge status-distributed">{ngoProfile.approvalStatus.toUpperCase()}</span></p>
                  <p><strong>Daily Capacity:</strong> {ngoProfile.capacity}</p>
                  <p><strong>Preferred Food Categories:</strong> {Array.isArray(ngoProfile.requirements) ? ngoProfile.requirements.join(', ') : ngoProfile.requirements}</p>
                  <p><strong>Location:</strong> {ngoProfile.location}</p>
                  <p><strong>Representative Contact:</strong> {ngoProfile.contactPerson} ({user.email})</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
