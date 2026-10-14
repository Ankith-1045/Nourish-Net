import React, { useState } from 'react';
import { api } from '../services/api';
import { IconCross } from './Icons';

export default function AuthModal({ isOpen, onClose, role, mode, onAuthSuccess, onSwitchMode }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Common Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // NGO Specific Registration States
  const [organizationName, setOrganizationName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [capacity, setCapacity] = useState('100');
  const [requirements, setRequirements] = useState('Cooked Meals, Fresh Produce');

  if (!isOpen || !role) return null;

  const isLogin = mode === 'login';

  const resetForm = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setAddress('');
    setOrganizationName('');
    setRegistrationNumber('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isLogin) {
        // Handle Login
        const res = await api.login(email, password, role);
        setSuccessMsg('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
          setIsSubmitting(false);
          resetForm();
          onAuthSuccess(res.user, role);
        }, 600);
      } else {
        // Handle Registration
        if (role === 'donor') {
          if (!name || !phone || !address) {
            setErrorMsg('Please fill in all required donor details.');
            setIsSubmitting(false);
            return;
          }
          const res = await api.registerDonor({ name, email, password, phone, address });
          setSuccessMsg('Account created successfully! Redirecting to Donor Dashboard...');
          setTimeout(() => {
            setIsSubmitting(false);
            resetForm();
            onAuthSuccess(res.user, 'donor');
          }, 800);
        } else if (role === 'ngo') {
          if (!organizationName || !registrationNumber || !name || !phone || !address) {
            setErrorMsg('Please fill in all required organization fields.');
            setIsSubmitting(false);
            return;
          }
          const res = await api.registerNgo({
            organizationName,
            registrationNumber,
            contactPerson: name,
            email,
            password,
            phone,
            location: address,
            capacity,
            requirements,
          });
          setSuccessMsg(res.message);
          setTimeout(() => {
            setIsSubmitting(false);
            resetForm();
            onClose();
          }, 2000);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred. Please check your credentials.');
      setIsSubmitting(false);
    }
  };

  const roleTitle = role === 'donor' ? 'Donor' : role === 'ngo' ? 'NGO / Charity' : 'Admin';

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={handleClose} aria-label="Close modal">
          <IconCross size={20} />
        </button>

        <div className="modal-header">
          <span className="modal-subtitle">{roleTitle.toUpperCase()} PORTAL</span>
          <h2 className="modal-title">
            {isLogin ? `${roleTitle} Login` : `Register New ${roleTitle}`}
          </h2>
          <p className="modal-desc">
            {isLogin
              ? `Enter your authorized ${roleTitle} credentials to access your dashboard.`
              : `Create an account to manage surplus food donations and community allocation.`}
          </p>
        </div>

        {errorMsg && <div className="alert-banner alert-error">{errorMsg}</div>}
        {successMsg && <div className="alert-banner alert-success">{successMsg}</div>}

        {role === 'admin' && isLogin && (
          <div className="admin-demo-box">
            <span className="demo-badge">PREDEFINED ADMIN CREDENTIALS</span>
            <div className="demo-credentials">
              <code>Email: admin@cognitude.org</code>
              <code>Password: admin123</code>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Registration specific fields */}
          {!isLogin && role === 'donor' && (
            <div className="form-group">
              <label>Full Name / Business Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. GreenBites Bistro / John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          {!isLogin && role === 'ngo' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label>Organization Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Helping Hands Shelter"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Registration / License Number *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. NGO-88402-NY"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Contact Representative Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sarah Connor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Daily Meal Capacity (meals/day)</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="e.g. 150"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Preferred Food Categories</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Cooked Meals, Bakery, Fresh Produce"
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Common Email & Password */}
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. name@organization.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label>Contact Phone Number *</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="e.g. +1 (555) 019-2831"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Address / Location *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 102 Hope Avenue, Downtown"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            className="button button--primary form-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? 'Processing...'
              : isLogin
              ? `Sign In to ${roleTitle} Dashboard →`
              : `Complete ${roleTitle} Registration →`}
          </button>

          {role !== 'admin' && (
            <div className="form-footer-switch">
              {isLogin ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => onSwitchMode('register')}
                  >
                    Register here
                  </button>
                </span>
              ) : (
                <span>
                  Already registered?{' '}
                  <button
                    type="button"
                    className="link-btn"
                    onClick={() => onSwitchMode('login')}
                  >
                    Login to account
                  </button>
                </span>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
