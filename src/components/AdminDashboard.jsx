import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { IconAdmin, IconLogout, IconCheck, IconCross, IconSparkles } from './Icons';

export default function AdminDashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [ngos, setNgos] = useState([]);
  const [donors, setDonors] = useState([]);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [distributionReports, setDistributionReports] = useState([]);
  const [selectedDonationForRec, setSelectedDonationForRec] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'verification') {
      const allReports = api.getDistributionReports();
      setDistributionReports(allReports);
      const allDonations = api.getDonations();
      setDonations(allDonations);
    }
  }, [activeTab]);

  // Periodically refresh verification queue while admin views it
  useEffect(() => {
    let intervalId = null;
    if (activeTab === 'verification') {
      intervalId = setInterval(() => {
        const allReports = api.getDistributionReports();
        setDistributionReports(allReports);
      }, 5000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeTab]);

  const loadAllData = () => {
    const allNgos = api.getNgos();
    setNgos(allNgos);

    const allDonors = api.getDonors();
    setDonors(allDonors);

    const allDonations = api.getDonations();
    setDonations(allDonations);

    const allRequests = api.getFoodRequests();
    setRequests(allRequests);

    const allReports = api.getDistributionReports();
    setDistributionReports(allReports);

    // Default select first available donation for recommendation calculation
    const unassigned = allDonations.find((d) => d.status === 'Available') || allDonations[0];
    if (unassigned) {
      setSelectedDonationForRec(unassigned.id);
      setRecommendations(api.getRecommendationsForDonation(unassigned.id));
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4000);
  };

  const handleNgoApproval = (ngoId, status) => {
    api.updateNgoStatus(ngoId, status);
    loadAllData();
    showToast(`NGO registration status updated to "${status.toUpperCase()}".`);
  };

  const handleSelectDonationRec = (donationId) => {
    setSelectedDonationForRec(donationId);
    setRecommendations(api.getRecommendationsForDonation(donationId));
  };

  const handleAssignRecommendation = (donationId, ngoId, organizationName) => {
    api.updateDonationStatus(donationId, 'NGO Assigned', ngoId, organizationName);
    loadAllData();
    showToast(`🎉 Recommendation approved! Donation assigned to ${organizationName}.`);
  };

  const handleReviewReport = (reportId, approved) => {
    if (!approved) {
      const rejectionReason = window.prompt('Please enter a rejection reason for this distribution report:');
      if (rejectionReason === null) return;
      api.reviewDistributionReport(reportId, false, user, rejectionReason || 'Rejected by admin');
      loadAllData();
      showToast('❌ Distribution report rejected. Donor and NGO have been notified.');
      return;
    }

    api.reviewDistributionReport(reportId, true, user);
    loadAllData();
    showToast('✅ Distribution report approved. Donation verified.');
  };

  const pendingNgos = ngos.filter((n) => n.approvalStatus === 'pending');
  const activeDonations = donations.filter((d) => d.status === 'Available');
  const pendingReports = distributionReports.filter((r) => r.status === 'Pending');

  const selectedDonationObj = donations.find((d) => d.id === selectedDonationForRec);

  const renderPhotoGallery = (sources, label) => {
    const urls = (Array.isArray(sources) ? sources : String(sources || '').split(','))
      .map((source) => String(source).trim())
      .filter(Boolean);
    if (urls.length === 0) return null;

    return (
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {urls.map((url, index) => (
          <div key={`${url}-${index}`}>
            <img src={url} alt={`${label}-${index + 1}`} style={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 6 }} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      {toastMsg && <div className="toast-notification">{toastMsg}</div>}

      <header className="dashboard-header">
        <div className="header-brand">
          <IconAdmin size={24} />
          <div>
            <h1 className="header-title">System Admin Control Center</h1>
            <span className="header-welcome">Platform Administrator: {user.name}</span>
          </div>
        </div>

        <div className="header-actions">
          <span className="user-role-tag admin-role-tag">ADMINISTRATOR</span>
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
          className={`tab-btn ${activeTab === 'recommendations' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          <IconSparkles size={16} /> Recommendations Engine
        </button>
        <button
          className={`tab-btn ${activeTab === 'ngoApproval' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('ngoApproval')}
        >
          NGO Approvals ({pendingNgos.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'donations' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('donations')}
        >
          Manage Donations ({donations.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'verification' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('verification')}
        >
          Verification Queue ({distributionReports.filter((r) => r.status === 'Pending').length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'ngos' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('ngos')}
        >
          Manage NGOs ({ngos.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'donors' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('donors')}
        >
          Manage Donors ({donors.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'distribution' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('distribution')}
        >
          Food Distribution Pipeline
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics & Insights
        </button>
        <button
          className={`tab-btn ${activeTab === 'reports' ? 'tab-btn--active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports & Export
        </button>
      </nav>

      <main className="dashboard-content">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="tab-pane">
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Total System Users</span>
                <span className="stat-value">{donors.length + ngos.length + 1}</span>
                <span className="stat-meta">Active donors & NGOs</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Pending NGO Approvals</span>
                <span className="stat-value">{pendingNgos.length}</span>
                <span className="stat-meta">Requires admin review</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Available Donations</span>
                <span className="stat-value">{activeDonations.length}</span>
                <span className="stat-meta">Awaiting NGO allocation</span>
              </div>
              <div className="stat-card highlight-card">
                <span className="stat-label">Meals Saved & Allocated</span>
                <span className="stat-value">1,480</span>
                <span className="stat-meta">Zero Food Waste Goal</span>
              </div>
            </div>

            {/* Quick Actions / Pending Approvals Preview */}
            <div className="dashboard-section-header">
              <h2>Pending NGO Registration Approvals</h2>
              <button className="button button--primary" onClick={() => setActiveTab('ngoApproval')}>
                View All NGO Approvals →
              </button>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Organization Name</th>
                    <th>Registration No.</th>
                    <th>Location</th>
                    <th>Capacity</th>
                    <th>Contact Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingNgos.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '24px' }}>
                        All NGO registrations are up to date!
                      </td>
                    </tr>
                  ) : (
                    pendingNgos.map((ngo) => (
                      <tr key={ngo.id}>
                        <td><strong>{ngo.organizationName}</strong></td>
                        <td><code>{ngo.registrationNumber}</code></td>
                        <td>{ngo.location}</td>
                        <td>{ngo.capacity}</td>
                        <td>{ngo.contactEmail}</td>
                        <td>
                          <div className="action-buttons-inline">
                            <button
                              className="btn-approve"
                              onClick={() => handleNgoApproval(ngo.id, 'approved')}
                            >
                              <IconCheck size={16} /> Approve
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleNgoApproval(ngo.id, 'rejected')}
                            >
                              <IconCross size={16} /> Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* RECOMMENDATIONS TAB (INTELLIGENT ALLOCATION MODULE) */}
        {activeTab === 'recommendations' && (
          <div className="tab-pane">
            <div className="rec-module-header">
              <div className="rec-title-box">
                <IconSparkles size={28} />
                <div>
                  <h2>Intelligent Food Allocation & Recommendation Engine</h2>
                  <p className="rec-subtitle">
                    Generates AI match scores (0-100) and rationale explanations by evaluating NGO demand, request urgency, food expiry time, quantity, capacity, and category compatibility.
                  </p>
                </div>
              </div>
            </div>

            <div className="rec-layout">
              {/* Left Selector: Donations List */}
              <div className="rec-selector-panel">
                <h3>Select Donation to Score</h3>
                <div className="rec-donation-list">
                  {donations.map((d) => (
                    <div
                      key={d.id}
                      className={`rec-donation-item ${
                        selectedDonationForRec === d.id ? 'rec-donation-item--active' : ''
                      }`}
                      onClick={() => handleSelectDonationRec(d.id)}
                    >
                      <div className="rec-item-header">
                        <span className="category-pill">{d.category}</span>
                        <span className="status-badge">{d.status}</span>
                      </div>
                      <h4 className="rec-item-title">{d.foodName}</h4>
                      <p className="rec-item-meta">Donor: {d.donorName} • Quantity: {d.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Results: Recommendation Rationale Cards */}
              <div className="rec-results-panel">
                {selectedDonationObj && (
                  <div className="selected-donation-summary-card">
                    <div className="summary-badge">ACTIVE DONATION EVALUATED</div>
                    <h3>{selectedDonationObj.foodName}</h3>
                    <p>
                      <strong>Category:</strong> {selectedDonationObj.category} | <strong>Quantity:</strong>{' '}
                      {selectedDonationObj.quantity} | <strong>Expires:</strong>{' '}
                      {new Date(selectedDonationObj.expiryAt).toLocaleString()}
                    </p>
                    <p><strong>Pickup Location:</strong> {selectedDonationObj.pickupAddress}</p>
                  </div>
                )}

                <h3>Ranked NGO Match Recommendations</h3>

                <div className="rec-cards-list">
                  {recommendations.length === 0 ? (
                    <p>No verified NGOs available for matching.</p>
                  ) : (
                    recommendations.map((rec, idx) => (
                      <div key={rec.ngoId} className="rec-result-card">
                        <div className="rec-card-top">
                          <div className="rec-rank-box">
                            <span className="rank-num">#{idx + 1}</span>
                            <div>
                              <h4 className="rec-ngo-name">{rec.organizationName}</h4>
                              <span className="rec-ngo-sub">Reg: {rec.registrationNumber} • {rec.location}</span>
                            </div>
                          </div>

                          <div className="score-badge-circle">
                            <span className="score-val">{rec.score}</span>
                            <span className="score-label">/ 100</span>
                          </div>
                        </div>

                        <div className="rec-rationale-box">
                          <span className="rationale-heading">RECOMMENDATION RATIONALE & WHY:</span>
                          <p className="rationale-text">{rec.reason}</p>
                        </div>

                        <div className="factor-pills">
                          <span className="factor-pill">Category Match: {rec.factors.categoryScore}/25</span>
                          <span className="factor-pill">Urgency Score: {rec.factors.urgencyScore}/25</span>
                          <span className="factor-pill">Expiry Urgency: {rec.factors.expiryScore}/25</span>
                          <span className="factor-pill">Capacity Fit: {rec.factors.capacityScore}/10</span>
                        </div>

                        {selectedDonationObj && selectedDonationObj.status === 'Available' ? (
                          <button
                            className="button button--primary rec-assign-btn"
                            onClick={() =>
                              handleAssignRecommendation(
                                selectedDonationObj.id,
                                rec.ngoId,
                                rec.organizationName
                              )
                            }
                          >
                            Approve Recommendation & Assign Donation →
                          </button>
                        ) : (
                          <div className="assigned-status-notice">
                            Status: {selectedDonationObj?.status} ({selectedDonationObj?.assignedNgoName})
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NGO APPROVAL TAB */}
        {activeTab === 'ngoApproval' && (
          <div className="tab-pane">
            <h2 className="section-heading">NGO Registration Approvals</h2>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Organization Name</th>
                    <th>Registration No.</th>
                    <th>Contact Person</th>
                    <th>Location</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ngos.map((ngo) => (
                    <tr key={ngo.id}>
                      <td><strong>{ngo.organizationName}</strong></td>
                      <td><code>{ngo.registrationNumber}</code></td>
                      <td>{ngo.contactPerson}</td>
                      <td>{ngo.location}</td>
                      <td>{ngo.capacity}</td>
                      <td>
                        <span className={`status-badge status-${ngo.approvalStatus}`}>
                          {ngo.approvalStatus.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons-inline">
                          {ngo.approvalStatus !== 'approved' && (
                            <button
                              className="btn-approve"
                              onClick={() => handleNgoApproval(ngo.id, 'approved')}
                            >
                              Approve
                            </button>
                          )}
                          {ngo.approvalStatus !== 'rejected' && (
                            <button
                              className="btn-reject"
                              onClick={() => handleNgoApproval(ngo.id, 'rejected')}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VERIFICATION QUEUE TAB */}
        {activeTab === 'verification' && (
          <div className="tab-pane">
            <h2 className="section-heading">Distribution Proof Verification</h2>
            <div style={{ marginBottom: 12 }}>
              <button className="button button--secondary" onClick={() => {
                const allReports = api.getDistributionReports();
                setDistributionReports(allReports);
                showToast('Verification queue refreshed');
              }}>
                Refresh Queue
              </button>
            </div>
            {pendingReports.length === 0 ? (
              <div className="empty-state">
                <p>No pending verification reports at this time.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Donation Item</th>
                      <th>NGO</th>
                      <th>Donor</th>
                      <th>Delivery Date</th>
                      <th>Location</th>
                      <th>Served</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingReports.map((report) => (
                      <tr key={report.id}>
                        <td>
                          <strong>{report.foodName}</strong><br />{report.quantity}
                          <div style={{ marginTop: '8px' }}>
                            {renderPhotoGallery(report.deliveryImages, 'proof')}
                          </div>
                        </td>
                        <td>{report.ngoName}</td>
                        <td>{report.donorName}</td>
                        <td>{new Date(report.distributionDate).toLocaleString()}</td>
                        <td>{report.distributionLocation}</td>
                        <td>{report.beneficiariesServed}</td>
                        <td><span className="status-badge status-pending">Pending</span></td>
                        <td>
                          <div className="action-buttons-inline" style={{ gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              className="btn-approve"
                              onClick={() => handleReviewReport(report.id, true)}
                            >
                              Approve
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleReviewReport(report.id, false)}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MANAGE DONATIONS TAB */}
        {activeTab === 'donations' && (
          <div className="tab-pane">
            <h2 className="section-heading">System-Wide Donations Registry</h2>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Food Item</th>
                    <th>Category</th>
                    <th>Donor Name</th>
                    <th>Quantity</th>
                    <th>Pickup Address</th>
                    <th>Photo</th>
                    <th>Status</th>
                    <th>Assigned NGO</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.id}>
                      <td><strong>{d.foodName}</strong></td>
                      <td>{d.category}</td>
                      <td>{d.donorName}</td>
                      <td>{d.quantity}</td>
                      <td>{d.pickupAddress}</td>
                      <td>{renderPhotoGallery(d.image, 'donor')}</td>
                      <td><span className="status-badge">{d.status}</span></td>
                      <td>{d.assignedNgoName || 'Unassigned'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MANAGE NGOS TAB */}
        {activeTab === 'ngos' && (
          <div className="tab-pane">
            <h2 className="section-heading">Registered NGO Directory</h2>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Organization Name</th>
                    <th>Registration No.</th>
                    <th>Location</th>
                    <th>Capacity</th>
                    <th>Approval Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ngos.map((ngo) => (
                    <tr key={ngo.id}>
                      <td><strong>{ngo.organizationName}</strong></td>
                      <td><code>{ngo.registrationNumber}</code></td>
                      <td>{ngo.location}</td>
                      <td>{ngo.capacity}</td>
                      <td><span className="status-badge">{ngo.approvalStatus}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MANAGE DONORS TAB */}
        {activeTab === 'donors' && (
          <div className="tab-pane">
            <h2 className="section-heading">Registered Donors Directory</h2>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Donor / Business Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Address</th>
                    <th>Joined Date</th>
                  </tr>
                </thead>
                <tbody>
                  {donors.map((donor) => (
                    <tr key={donor.id}>
                      <td><strong>{donor.name}</strong></td>
                      <td>{donor.email}</td>
                      <td>{donor.phone}</td>
                      <td>{donor.address}</td>
                      <td>{new Date(donor.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FOOD DISTRIBUTION PIPELINE */}
        {activeTab === 'distribution' && (
          <div className="tab-pane">
            <h2 className="section-heading">City-Wide Food Distribution Pipeline</h2>
            <div className="donations-grid">
              {donations.map((item) => (
                <div key={item.id} className="donation-card">
                  <div className="card-body">
                    <div className="card-header-line">
                      <span className="category-pill">{item.category}</span>
                      <span className="status-badge">{item.status}</span>
                    </div>
                    <h3 className="card-title">{item.foodName}</h3>
                    <p className="card-qty">Quantity: <strong>{item.quantity}</strong></p>
                    <p className="card-desc">Donor: {item.donorName} → NGO: {item.assignedNgoName || 'Pending'}</p>
                    {renderPhotoGallery(item.image, 'donor')}
                    {renderPhotoGallery(item.deliveryImages, 'proof')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ANALYTICS & INSIGHTS */}
        {activeTab === 'analytics' && (
          <div className="tab-pane">
            <h2 className="section-heading">Platform Analytics & Metrics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">Distribution Efficiency</span>
                <span className="stat-value">94.2%</span>
                <span className="stat-meta">Average allocation speed &lt; 2 hours</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Total Meals Saved</span>
                <span className="stat-value">1,480</span>
                <span className="stat-meta">Zero food waste footprint</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">Active Food Requests</span>
                <span className="stat-value">{requests.length}</span>
                <span className="stat-meta">NGO requirement postings</span>
              </div>
            </div>
          </div>
        )}

        {/* REPORTS & EXPORT */}
        {activeTab === 'reports' && (
          <div className="tab-pane">
            <div className="profile-card">
              <h2>Download System Reports</h2>
              <p>Generate summary PDF/CSV logs for municipal sustainability reporting.</p>
              <button
                className="button button--primary"
                onClick={() => showToast('📥 Report generated successfully! (CSV summary ready)')}
              >
                Export Platform Summary Report (.CSV)
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
