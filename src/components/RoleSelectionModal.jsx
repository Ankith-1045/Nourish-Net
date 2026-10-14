import React, { useState } from 'react';
import { IconDonor, IconNGO, IconAdmin, IconCross } from './Icons';

export default function RoleSelectionModal({ isOpen, onClose, onSelectRole }) {
  const [selectedRole, setSelectedRole] = useState(null);

  if (!isOpen) return null;

  const handleRoleClick = (role) => {
    setSelectedRole(role);
  };

  const handleAction = (mode) => {
    if (!selectedRole) return;
    onSelectRole(selectedRole, mode);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container role-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <IconCross size={20} />
        </button>

        <div className="modal-header">
          <span className="modal-subtitle">CHOOSE YOUR PORTAL</span>
          <h2 className="modal-title">Select User Role</h2>
          <p className="modal-desc">
            Join Cognitude's intelligent food allocation platform to eliminate surplus food waste and feed communities.
          </p>
        </div>

        <div className="role-cards-grid">
          <div
            className={`role-card ${selectedRole === 'donor' ? 'role-card--active' : ''}`}
            onClick={() => handleRoleClick('donor')}
          >
            <div className="role-card-icon role-icon-donor">
              <IconDonor size={28} />
            </div>
            <h3 className="role-card-title">Food Donor</h3>
            <p className="role-card-desc">
              Restaurants, supermarkets, event hosts, and individuals donating surplus edible food.
            </p>
            <div className="role-card-badge">Donate Surplus</div>
          </div>

          <div
            className={`role-card ${selectedRole === 'ngo' ? 'role-card--active' : ''}`}
            onClick={() => handleRoleClick('ngo')}
          >
            <div className="role-card-icon role-icon-ngo">
              <IconNGO size={28} />
            </div>
            <h3 className="role-card-title">NGO / Shelter</h3>
            <p className="role-card-desc">
              Verified food shelters, charities, and community kitchens distributing food to those in need.
            </p>
            <div className="role-card-badge">Receive Food</div>
          </div>

          <div
            className={`role-card ${selectedRole === 'admin' ? 'role-card--active' : ''}`}
            onClick={() => handleRoleClick('admin')}
          >
            <div className="role-card-icon role-icon-admin">
              <IconAdmin size={28} />
            </div>
            <h3 className="role-card-title">System Admin</h3>
            <p className="role-card-desc">
              Platform administrators managing NGO approvals, intelligent allocation, and distribution.
            </p>
            <div className="role-card-badge">Manage & Allocate</div>
          </div>
        </div>

        {selectedRole && (
          <div className="modal-actions-container">
            {selectedRole === 'admin' ? (
              <div className="role-action-group">
                <p className="admin-notice-text">
                  🛡️ Admin accounts require predefined administrative credentials.
                </p>
                <button
                  className="button button--primary modal-action-btn"
                  onClick={() => handleAction('login')}
                >
                  Proceed to Admin Login →
                </button>
              </div>
            ) : (
              <div className="role-action-group">
                <button
                  className="button button--primary modal-action-btn"
                  onClick={() => handleAction('login')}
                >
                  Log In as {selectedRole.toUpperCase()} →
                </button>
                <button
                  className="button button--secondary modal-action-btn"
                  onClick={() => handleAction('register')}
                >
                  Register New {selectedRole.toUpperCase()} Account
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
