import React, { useState, useEffect, useRef } from 'react';
import './App.css';

import { api } from './services/api';
import RoleSelectionModal from './components/RoleSelectionModal';
import AuthModal from './components/AuthModal';
import DonorDashboard from './components/DonorDashboard';
import NgoDashboard from './components/NgoDashboard';
import AdminDashboard from './components/AdminDashboard';
import { IconDonor, IconNGO, IconAdmin, IconLogout } from './components/Icons';

function App() {
  const insightsRef = useRef(null);

  // Authentication & View State
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'donor_dashboard' | 'ngo_dashboard' | 'admin_dashboard'

  // Modals state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState(null); // 'donor' | 'ngo' | 'admin'
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [authNotice, setAuthNotice] = useState('');

  // Check saved session on load
  useEffect(() => {
    const user = api.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      // Synchronize view with user role
      switch (user.role) {
        case 'donor':
          setCurrentView('donor_dashboard');
          break;
        case 'ngo':
          setCurrentView('ngo_dashboard');
          break;
        case 'admin':
          setCurrentView('admin_dashboard');
          break;
        default:
          setCurrentView('landing');
      }
    }
  }, []);

  const safeScroll = (distance) => {
    if (!insightsRef.current) return;
    insightsRef.current.scrollBy({ left: distance, behavior: 'smooth' });
  };

  const handleOpenRoleSelection = () => {
    setIsRoleModalOpen(true);
  };

  const handleRoleSelected = (role, mode) => {
    setAuthRole(role);
    setAuthMode(mode);
    setIsRoleModalOpen(false);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user, role) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setAuthRole(null);

    switch (role) {
      case 'donor':
        setCurrentView('donor_dashboard');
        break;
      case 'ngo':
        setCurrentView('ngo_dashboard');
        break;
      case 'admin':
        setCurrentView('admin_dashboard');
        break;
      default:
        setCurrentView('landing');
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setCurrentView('landing');
  };

  const handleSwitchAuthMode = (newMode) => {
    setAuthMode(newMode);
  };

  // Protected Route Check
  const renderDashboard = () => {
    if (!currentUser) {
      return (
        <div className="protected-denied-box">
          <h2>Access Denied</h2>
          <p>You must log in with authorized credentials to view this dashboard.</p>
          <button className="button button--primary" onClick={handleOpenRoleSelection}>
            Select Role & Log In →
          </button>
        </div>
      );
    }

    if (currentView === 'donor_dashboard') {
      if (currentUser.role !== 'donor') {
        return (
          <div className="protected-denied-box">
            <h2>Unauthorized Route</h2>
            <p>Donors only area. You are currently logged in as {currentUser.role.toUpperCase()}.</p>
            <button className="button button--secondary" onClick={() => setCurrentView(`${currentUser.role}_dashboard`)}>
              Return to your {currentUser.role} dashboard →
            </button>
          </div>
        );
      }
      return <DonorDashboard user={currentUser} onLogout={handleLogout} />;
    }

    if (currentView === 'ngo_dashboard') {
      if (currentUser.role !== 'ngo') {
        return (
          <div className="protected-denied-box">
            <h2>Unauthorized Route</h2>
            <p>NGO shelter portal only. You are logged in as {currentUser.role.toUpperCase()}.</p>
            <button className="button button--secondary" onClick={() => setCurrentView(`${currentUser.role}_dashboard`)}>
              Return to your {currentUser.role} dashboard →
            </button>
          </div>
        );
      }
      return <NgoDashboard user={currentUser} onLogout={handleLogout} />;
    }

    if (currentView === 'admin_dashboard') {
      if (currentUser.role !== 'admin') {
        return (
          <div className="protected-denied-box">
            <h2>Access Restricted</h2>
            <p>Admin Control Center only. Donors and NGOs cannot access Admin area.</p>
            <button className="button button--secondary" onClick={() => setCurrentView(`${currentUser.role}_dashboard`)}>
              Return to your {currentUser.role} dashboard →
            </button>
          </div>
        );
      }
      return <AdminDashboard user={currentUser} onLogout={handleLogout} />;
    }

    return null;
  };

  const expertiseCards = [
    {
      num: '(01)',
      title: 'Smart Food Collection',
      desc: 'Collect surplus food from restaurants, hotels, supermarkets, events, and households through a simple donation process that minimizes food waste and supports communities in need.',
    },
    {
      num: '(02)',
      title: 'AI-Powered NGO Matching',
      desc: 'Automatically recommend the most suitable NGO using food quantity, expiry time, urgency, location, and current demand for faster and smarter distribution.',
    },
    {
      num: '(03)',
      title: 'Real-Time Donation Tracking',
      desc: 'Track every donation from submission to delivery with live status updates, ensuring transparency and efficient coordination among donors, NGOs, and administrators.',
    },
    {
      num: '(04)',
      title: 'Verified NGO Network',
      desc: 'Connect trusted donors with verified NGOs through a secure platform that enables reliable food collection, distribution, and collaboration.',
    },
    {
      num: '(05)',
      title: 'Impact Analytics',
      desc: 'Visualize food saved, people served, donation trends, environmental impact, and operational insights through interactive dashboards and real-time analytics.',
    },
  ];

  const expertiseTrack = [...expertiseCards, ...expertiseCards];

  return (
    <div className="app">
      {/* Dynamic Navigation Bar */}
      <header className="navbar">
        <div className="navbar__container">
          <a
            href="#home"
            className="navbar__brand"
            onClick={(e) => {
              e.preventDefault();
              setCurrentView('landing');
            }}
          >
            <img
              src="https://cognitude.in/assets/Frame%201143%20(1)-CGDzi3zB.png"
              alt="Cognitude Logo"
              className="navbar__logo"
            />
            <span>NourishNet</span>
          </a>

          <nav className="navbar__nav" aria-label="Primary navigation">
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                setCurrentView('landing');
              }}
            >
              Home
            </a>
            <a href="#about" onClick={() => setCurrentView('landing')}>
              Features
            </a>
            <a href="#arts" onClick={() => setCurrentView('landing')}>
              Innovation
            </a>
            <a href="#thought-leadership" onClick={() => setCurrentView('landing')}>
              Impact
            </a>

            {currentUser && (
              <a
                href={`#${currentUser.role}/dashboard`}
                className="nav-dashboard-link"
                onClick={(e) => {
                  e.preventDefault();
                  setCurrentView(`${currentUser.role}_dashboard`);
                }}
              >
                Go to Dashboard
              </a>
            )}
          </nav>

          <div className="navbar__right-actions">
            {currentUser ? (
              <div className="navbar-user-bar">
                <span className="navbar-user-badge">
                  {currentUser.role.toUpperCase()}: {currentUser.name}
                </span>
                <button
                  className="navbar__cta navbar__cta--secondary"
                  onClick={() => setCurrentView(`${currentUser.role}_dashboard`)}
                >
                  Dashboard
                </button>
              </div>
            ) : (
              <div className="navbar-auth-buttons">
                <button className="navbar__cta" onClick={handleOpenRoleSelection}>
                  Get Started →
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Render Switch */}
      {currentView !== 'landing' ? (
        <div className="dashboard-wrapper-view">{renderDashboard()}</div>
      ) : (
        /* LANDING PAGE - 100% Preserved */
        <main className="landing-main-wrapper">
          <section className="hero-page" id="home">
            <div className="hero-bg-right">
              <img
                src="https://images.openai.com/static-rsc-4/XCoDlF1yjSYsIqLPmbTWS9YbPdScnzKsmEoioz2hFnq3crWuJsZvA6JBWR61DZuGKCiowK4NvHhuVA3aayZE3jjMEt3y_Wo1CrKfM4b1AuYvq3px8CqWiHa8knfsiQ9H7NX20F9Q5K7rXT_MnycTPkfq21ybrds8XFdMJGxo5iKySLtlZfwCrQZ95uud9aT7?purpose=fullsize"
                alt="Community Food Donation"
              />
              <div className="hero-bg-overlay" />
            </div>
            <section className="hero-content">
              <h1>Connecting Surplus Food with Those Who Need It Most</h1>
              <p>
                NourishNet is a smart food donation and distribution platform that connects food donors, NGOs, and administrators through one seamless system. Our mission is to reduce food waste, ensure transparent food distribution, and deliver meals efficiently to communities in need.
              </p>

              <div className="hero-buttons">
                <button className="button button--primary" onClick={handleOpenRoleSelection}>
                  Get Started / Select Role →
                </button>
                <button className="button button--secondary" onClick={handleOpenRoleSelection}>
                  Join the Mission
                </button>
              </div>

              <div className="hero-partners">
                <div className="partners-inner">
                  <div className="partners-label">
                    Trusted by NGOs, Food Donors &amp; <br /> Community Partners
                  </div>
                  <div className="carousel-container">
                    <div className="carousel-track">
                      {[2, 3, 4, 5, 6, 2, 3, 4, 5, 6].map((num, idx) => (
                        <div className="brand-item" key={idx}>
                          <img src={`/images/${num}.png`} alt="Partner Logo" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>

          <section className="expertise-section" id="about">
            <div className="expertise-bg" aria-hidden="true">
              <img
                className="expertise-bg-img"
                src="https://cognitude.in/images/hf_20260323_111725_a2dc547b-66b7-4e3c-b418-9245515eb20d%20-%20Copy.png"
                alt="Expertise Background"
              />
            </div>
            <div className="expertise-inner">
              <div className="expertise-header">
                <h2 className="expertise-title">
                  Smart Food Distribution <em>Platform</em>
                </h2>
              </div>

              <div className="expertise-carousel">
                <div className="expertise-track" aria-hidden="false">
                  {expertiseTrack.map((card, idx) => (
                    <div className="expertise-card" key={idx} aria-hidden={idx >= expertiseCards.length}>
                      <div className="expertise-card-header">
                        <span className="expertise-card-num">{card.num}</span>
                        <span className="expertise-card-title">{card.title}</span>
                      </div>
                      <p className="expertise-card-desc">{card.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="ce-section" id="arts">
            <div className="ce-inner">
              <div className="ce-header">
                <h2 className="ce-title">
                  Smart <em>Platform Features</em>
                </h2>
              </div>
              <div className="ce-grid">
                <div className="ce-card">
                  <div className="ce-card-content">
                    <span className="ce-num">(01)</span>
                    <h3 className="ce-card-title">Intelligent Food Matching</h3>
                    <p className="ce-card-desc">AI-powered recommendations intelligently connect food donors with NGOs based on food type, quantity, location, urgency, and real-time demand to maximize food utilization and reduce waste.</p>
                  </div>
                  <div className="ce-visual">
                    <img
                      alt="Intelligent Food Matching"
                      src="https://cognitude.in/images/hf_20260323_111428_49b4b86d-286d-439b-a8bf-fd886b2ea67b.png"
                    />
                  </div>
                </div>

                <div className="ce-card">
                  <div className="ce-card-content">
                    <span className="ce-num">(02)</span>
                    <h3 className="ce-card-title">Smart Inventory Tracking</h3>
                    <p className="ce-card-desc">Track donated food through a centralized inventory with expiry-aware prioritization, live stock monitoring, and intelligent allocation to ensure timely distribution.</p>
                  </div>
                  <div className="ce-visual">
                    <img
                      alt="Smart Inventory Tracking"
                      src="https://cognitude.in/images/hf_20260324_091449_c0852301-c250-4c31-89b7-6a167f61ff29%20-%20Copy.png"
                    />
                  </div>
                </div>

                <div className="ce-card">
                  <div className="ce-card-content">
                    <span className="ce-num">(03)</span>
                    <h3 className="ce-card-title">Unified Management Portal</h3>
                    <p className="ce-card-desc">Role-based dashboards for Donors, NGOs, and Administrators to manage donations, food requests, approvals, inventory, analytics, and complete distribution workflows from one platform.</p>
                  </div>
                  <div className="ce-visual">
                    <img
                      alt="Unified Management Portal"
                      src="https://cognitude.in/images/hf_20260323_111428_3b7d3312-ee0a-44ed-972a-0962df78c65a%20-%20Copy.png"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="ww-section">
            <div className="ww-inner">
              <div className="ww-header">
                <h2 className="ww-title">
                  Who We <em> Work With</em>
                </h2>
              </div>
              <div className="ww-cards-layout">
                <div className="ww-col col-1">
                  <div className="ww-card">
                    <h3 className="ww-card-title">Food Donors</h3>
                    <p className="ww-card-desc">Restaurants, hotels, supermarkets, event organizers, and individuals who contribute surplus food through the platform.</p>
                  </div>
                </div>
                <div className="ww-col col-2">
                  <div className="ww-card">
                    <h3 className="ww-card-title">NGO Partners</h3>
                    <p className="ww-card-desc">Verified NGOs that receive food donations based on demand, urgency, beneficiary count, and location.</p>
                  </div>
                  <div className="ww-card">
                    <h3 className="ww-card-title">Platform Administrators</h3>
                    <p className="ww-card-desc">Manage users, verify NGOs, approve donations, monitor platform activity, and oversee the complete food distribution process.</p>
                  </div>
                </div>
                <div className="ww-col col-center">
                  <div className="ww-hero-card">
                    <div className="ww-center-glow"></div>
                    <div className="ww-logo-box">
                      <img
                        src="https://cognitude.in/assets/Frame%201143%20-%20Copy-CfpVuguN.png"
                        alt="Cognitude Logo"
                        className="ww-logo"
                      />
                    </div>
                  </div>
                </div>
                <div className="ww-col col-4">
                  <div className="ww-card">
                    <h3 className="ww-card-title">Volunteers &amp; Communities</h3>
                    <p className="ww-card-desc">Support local food distribution, coordinate deliveries, and help ensure timely food reaches people in need.</p>
                  </div>
                  <div className="ww-card">
                    <h3 className="ww-card-title">Social Impact Organizations</h3>
                    <p className="ww-card-desc">Government bodies, charities, and CSR partners collaborating to reduce food waste and improve food accessibility.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="insights-section" id="thought-leadership">
            <div className="section-header">
              <h2 className="main-title">
                Insights <span className="serif-italic">&amp; Futures</span>
              </h2>
            </div>
            <div className="futures-grid" ref={insightsRef}>
              {[
                {
                  href: '#',
                  img: 'https://cognitude.in/assets/new_blog_education-DxyA329L.jpg',
                  title: 'Smart Food Allocation',
                  desc: 'AI-powered recommendations analyze food availability, NGO demand, location, urgency, and quantity to ensure every donation reaches the right organization efficiently.',
                  number: '(01)',
                },
                {
                  href: '#',
                  img: 'https://cognitude.in/assets/new_blog_research-DNPjlnLa.jpg',
                  title: 'Real-Time Inventory Intelligence',
                  desc: 'Track donated food with live inventory monitoring, expiry alerts, stock availability, and automated prioritization for effective distribution.',
                  number: '(02)',
                },
                {
                  href: '#',
                  img: 'https://cognitude.in/assets/new_blog_wellness-Ba7Jrdz3.jpg',
                  title: 'Role-Based Platform Management',
                  desc: 'Dedicated dashboards for Donors, NGOs, and Administrators streamline donations, approvals, food requests, inventory management, and platform operations.',
                  number: '(03)',
                },
                {
                  href: '#',
                  img: 'https://cognitude.in/assets/new_blog_arts-Cp_QNm5_.jpg',
                  title: 'Analytics & Social Impact',
                  desc: 'Interactive dashboards provide insights into food saved, meals delivered, donation trends, NGO performance, and overall community impact through visual analytics.',
                  number: '(04)',
                },
              ].map((item, index) => (
                <div className="blog-card" key={index}>
                  <div className="blog-image-wrapper">
                    <img className="blog-image" src={item.img} alt={item.title} />
                  </div>
                  <div className="blog-content">
                    <span className="item-number">{item.number}</span>
                    <h3 className="item-title">{item.title}</h3>
                    <p className="item-desc">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="carousel-nav">
              <button
                type="button"
                className="nav-btn prev-btn"
                aria-label="Previous"
                onClick={() => insightsRef.current && safeScroll(-insightsRef.current.clientWidth)}
              >
                ←
              </button>
              <button
                type="button"
                className="nav-btn next-btn"
                aria-label="Next"
                onClick={() => insightsRef.current && safeScroll(insightsRef.current.clientWidth)}
              >
                →
              </button>
            </div>
          </section>

          <section className="cta-section" id="connect">
            <div className="cta-background">
              <img
                src="https://cognitude.in/assets/cta-bg-DI4w5Vnw.png"
                alt="CTA Background"
                className="cta-bg-image"
              />
              <div className="cta-overlay" />
            </div>
            <div className="cta-content">
              <h2 className="cta-heading">Together, Let's End Food Waste</h2>
              <p className="cta-subheading">
                Connect food donors, NGOs, and administrators through one smart platform that reduces food waste and ensures surplus food reaches people in need quickly, safely, and transparently.
              </p>
            </div>
            <div className="cta-footer-links">
              <button className="footer-link" onClick={handleOpenRoleSelection}>
                + Donate Food
              </button>
              <button className="footer-link" onClick={handleOpenRoleSelection}>
                + Register as NGO
              </button>
              <button className="footer-link" onClick={handleOpenRoleSelection}>
                + Track Distribution
              </button>
            </div>
          </section>

          <footer className="footer">
            <div className="footer-top">
              <div className="footer-brand">
                <a className="footer-logo" href="/" data-discover="true">
                  <span className="logo1-icon">
                    <img
                      src="https://cognitude.in/assets/icon-Bc2aESSI.png"
                      alt="Cognitude Icon"
                      className="logo1-image"
                    />
                  </span>
                  <span className="logo1-text">NourishNet</span>
                </a>
                <p className="footer-tagline">
                  Building the future of intelligence Powered by neuroscience, AI, art, and philosophy
                </p>
              </div>
              <div className="footer-links">
                <a href="#terms">Terms</a>
                <a href="#privacy">Privacy</a>
                <a href="#cookies">Cookies</a>
                <a href="#accessibility">Accessibility</a>
              </div>
            </div>
            <div className="center">
              <div className="footer-media">
                <div className="media-container transition-media">
                  <video
                    src="https://cognitude.in/images/iH1wVLZtOjfJFQCV8iUj7qFjOEc.mp4"
                    autoPlay
                    loop
                    playsInline
                    muted
                    className="footer-video"
                  />
                </div>
                <div className="media-container transition-media">
                  <video
                    src="https://cognitude.in/images/iH1wVLZtOjfJFQCV8iUj7qFjOEc.mp4"
                    autoPlay
                    loop
                    playsInline
                    muted
                    className="footer-video"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                </div>
              </div>
            </div>
            <div className="footer-bottom">
              <div className="footer-copyright">Copyrights © 2026 NourishNet. All Rights Reserved</div>
            </div>
          </footer>
        </main>
      )}

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        onSelectRole={handleRoleSelected}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        role={authRole}
        mode={authMode}
        onAuthSuccess={handleAuthSuccess}
        onSwitchMode={handleSwitchAuthMode}
      />
    </div>
  );
}

export default App;