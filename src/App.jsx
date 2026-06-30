import { useRef } from 'react'
import './App.css'

function App() {
  const insightsRef = useRef(null)
  const safeScroll = (distance) => {
    if (!insightsRef.current) return
    insightsRef.current.scrollBy({ left: distance, behavior: 'smooth' })
  }
  const expertiseCards = [
    {
      num: '(01)',
      title: 'Research & Analytics',
      desc:
        'Usability studies, behavioral modeling, and neuroscience methods like EEG and eye-tracking for human-systems insights.',
    },
    {
      num: '(02)',
      title: 'Creative Systems',
      desc:
        'Multimodal art, immersive experiences, and storytelling frameworks that connect people, culture, and technology.',
    },
    {
      num: '(03)',
      title: 'Innovation Strategy',
      desc:
        'Strategic advisory for product vision, systems design, and emerging practice models across cognitive and digital ecosystems.',
    },
    {
      num: '(04)',
      title: 'Cognitive Technology',
      desc:
        'Designing intelligent systems with NLP, speech recognition, AI assistants, and BCIs for human-aware technology.',
    },
    {
      num: '(05)',
      title: 'Education & Training',
      desc:
        'Cognition-driven solutions including EdTech platforms, curriculum design, and tools for cognitive evaluation.',
    },
  ]

  const expertiseTrack = [...expertiseCards, ...expertiseCards]

  return (
    <div className="app">
      <header className="navbar">
        <div className="navbar__container">
          <a href="#home" className="navbar__brand">
            <img
              src="https://cognitude.in/assets/Frame%201143%20(1)-CGDzi3zB.png"
              alt="Cognitude Logo"
              className="navbar__logo"
            />
            <span>Cognitude</span>
          </a>

          <nav className="navbar__nav" aria-label="Primary navigation">
            <a href="#home">Home</a>
            <a href="#about">Expertise</a>
            <a href="#services">Arts & Innovation</a>
            <a href="#contact">Thought Leadership</a>
          </nav>

          <a className="navbar__cta" href="#contact">
            Contact Us →
          </a>
        </div>
      </header>

      <main className="hero-page" id="home">
        <section className="hero-content">
          <h1>Designing the future of human intelligence</h1>
          <p>
            We are an interdisciplinary enterprise operating at the intersection of cognitive neuroscience,
            artificial intelligence, arts, and philosophy.
          </p>

          <div className="hero-buttons">
            <a className="button button--primary" href="#services">
              Explore Our Services →
            </a>
            <a className="button button--secondary" href="#contact">
              Collaborate With Us
            </a>
          </div>
          <div className="hero-partners">
            <div className="partners-inner">
              <div className="partners-label">
                Powering 100+ <br /> Partners Worldwide
              </div>
              <div className="carousel-container">
                <div className="carousel-track">
                  <div className="brand-item">
                    <img src="/images/1.png" alt="Partner Logo" />
                  </div>
                  <div className="brand-item">
                    <img src="/images/2.png" alt="Partner Logo" />
                  </div>
                  <div className="brand-item">
                    <img src="/images/3.png" alt="Partner Logo" />
                  </div>
                  <div className="brand-item">
                    <img src="/images/4.png" alt="Partner Logo" />
                  </div>
                  <div className="brand-item">
                    <img src="/images/5.png" alt="Partner Logo" />
                  </div>
                  <div className="brand-item">
                    <img src="/images/6.png" alt="Partner Logo" />
                  </div>
                  <div className="brand-item">
                    <img src="/images/7.png" alt="Partner Logo" />
                  </div>
                  <div className="brand-item">
                    <img src="/images/8.png" alt="Partner Logo" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <section className="expertise-section" id="about">
        <div className="expertise-bg" aria-hidden="true">
          <img className="expertise-bg-img" src="https://cognitude.in/images/hf_20260323_111725_a2dc547b-66b7-4e3c-b418-9245515eb20d%20-%20Copy.png" alt="Expertise Background" /></div>
        <div className="expertise-inner">
          <div className="expertise-header">
            <h2 className="expertise-title">
              Expertise & Strategic <em>Domains</em>
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
              Creative <em>Engineering</em>
            </h2>
          </div>
          <div className="ce-grid">
            <div className="ce-card">
              <div className="ce-card-content">
                <span className="ce-num">(01)</span>
                <h3 className="ce-card-title">Performing Arts</h3>
                <p className="ce-card-desc">Engaging cognitive processes in creativity, emotion, and memory.</p>
              </div>
              <div className="ce-visual">
                <img alt="Performing Arts" src="https://cognitude.in/images/hf_20260323_111428_49b4b86d-286d-439b-a8bf-fd886b2ea67b.png" />
              </div>
            </div>

            <div className="ce-card">
              <div className="ce-card-content">
                <span className="ce-num">(02)</span>
                <h3 className="ce-card-title">Art Therapy & Mental Health</h3>
                <p className="ce-card-desc">Using creative processes for cognitive and emotional well-being.</p>
              </div>
              <div className="ce-visual">
                <img alt="Art Therapy & Mental Health" src="https://cognitude.in/images/hf_20260324_091449_c0852301-c250-4c31-89b7-6a167f61ff29%20-%20Copy.png" />
              </div>
            </div>

            <div className="ce-card">
              <div className="ce-card-content">
                <span className="ce-num">(03)</span>
                <h3 className="ce-card-title">Product Ideas</h3>
                <p className="ce-card-desc">Blending cognitive science with artistic and also innovation.</p>
              </div>
              <div className="ce-visual">
                <img alt="Product Ideas" src="https://cognitude.in/images/hf_20260323_111428_3b7d3312-ee0a-44ed-972a-0962df78c65a%20-%20Copy.png" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ww-section">
        <div className="ww-inner">
          <div className="ww-header">
          <h2 className="ww-title">
            Who We
            <em> Work With</em>
          </h2>
        </div>
          <div className="ww-cards-layout">
          <div className="ww-col col-1">
            <div className="ww-card">
              <h3 className="ww-card-title">Technology and AI Companies</h3>
              <p className="ww-card-desc">Building human-aware systems.</p>
            </div>
          </div>
          <div className="ww-col col-2">
            <div className="ww-card">
              <h3 className="ww-card-title">Educational Institutions</h3>
              <p className="ww-card-desc">Advancing learning with cognitive tools.</p>
            </div>
            <div className="ww-card">
              <h3 className="ww-card-title">Mental Health Professionals</h3>
              <p className="ww-card-desc">Supporting wellness innovations.</p>
            </div>
          </div>
          <div className="ww-col col-center">
            <div className="ww-hero-card">
              <div className="ww-center-glow"></div>
              <div className="ww-logo-box">
                <img src="https://cognitude.in/assets/Frame%201143%20-%20Copy-CfpVuguN.png" alt="Cognitude Logo" className="ww-logo" />
              </div>
            </div>
          </div>
          <div className="ww-col col-4">
            <div className="ww-card">
              <h3 className="ww-card-title">Artists and Creative Practitioners</h3>
              <p className="ww-card-desc">Enhancing artistic expression.</p>
            </div>
            <div className="ww-card">
              <h3 className="ww-card-title">Research Organizations</h3>
              <p className="ww-card-desc">Collaborating on cognitive studies.</p>
            </div>
          </div>
          </div>
        </div>
      </section>

      <section className="insights-section" id="thought-leadership">
        <div className="section-header">
          <h2 className="main-title">Insights <span className="serif-italic">&amp; Futures</span></h2>
        </div>
        <div className="futures-grid" ref={insightsRef}>
          {[
            {
              href: '/blog/education-futures',
              img: 'https://cognitude.in/assets/new_blog_education-DxyA329L.jpg',
              title: 'Education Futures',
              desc: 'AI partners, neurofeedback, personalized learning blending AI and cognition.',
              number: '(01)',
            },
            {
              href: '/blog/research-futures',
              img: 'https://cognitude.in/assets/new_blog_research-DNPjlnLa.jpg',
              title: 'Research Futures',
              desc: 'Explainable AI, data integration, precision analytics, ethical neuroanalytics.',
              number: '(02)',
            },
            {
              href: '/blog/wellness-futures',
              img: 'https://cognitude.in/assets/new_blog_wellness-Ba7Jrdz3.jpg',
              title: 'Wellness Futures',
              desc: 'AI diagnostics, VR therapies, neural targeting for preventive care.',
              number: '(03)',
            },
            {
              href: '/blog/ai-arts-futures',
              img: 'https://cognitude.in/assets/new_blog_arts-Cp_QNm5_.jpg',
              title: 'AI & Arts Futures',
              desc: 'Human-AI symbiosis, neuromorphic devices, enhanced performances.',
              number: '(04)',
            },
          ].map((item, index) => (
            <a className="blog-card" href={item.href} key={index} data-discover="true">
              <div className="blog-image-wrapper">
                <img className="blog-image" src={item.img} alt={item.title} />
              </div>
              <div className="blog-content">
                <span className="item-number">{item.number}</span>
                <h3 className="item-title">{item.title}</h3>
                <p className="item-desc">{item.desc}</p>
              </div>
            </a>
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
          <img src="https://cognitude.in/assets/cta-bg-DI4w5Vnw.png" alt="CTA Background" className="cta-bg-image" />
          <div className="cta-overlay" />
        </div>
        <div className="cta-content">
          <h2 className="cta-heading">Let’s Build Human-Centred Futures</h2>
          <p className="cta-subheading">Collaborate on research, products, training, or innovation with science-driven approaches.</p>
        </div>
        <div className="cta-footer-links">
          <a href="#start" className="footer-link">+ Start a Collaboration</a>
          <a href="#request" className="footer-link">+ Request a Consultation</a>
          <a href="mailto:cognitude.science@gmail.com?subject=Workshops%20-%20Let%27s%20Build%20Human-Centred%20Futures" className="footer-link">+ Explore Workshops</a>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="footer-logo" href="/" data-discover="true">
              <span className="logo1-icon">
                <img src="https://cognitude.in/assets/icon-Bc2aESSI.png" alt="Cognitude Icon" className="logo1-image" />
              </span>
              <span className="logo1-text">Cognitude</span>
            </a>
            <p className="footer-tagline">Building the future of intelligence Powered by neuroscience, AI, art, and philosophy</p>
          </div>
          <div className="footer-links">
            <a href="#terms" data-discover="true">Terms</a>
            <a href="#privacy" data-discover="true">Privacy</a>
            <a href="#cookies" data-discover="true">Cookies</a>
            <a href="#accessibility" data-discover="true">Accessibility</a>
          </div>
        </div>
        <div className="center">
          <div className="footer-media">
            <div className="media-container transition-media">
              <video src="https://cognitude.in/images/iH1wVLZtOjfJFQCV8iUj7qFjOEc.mp4" autoPlay loop playsInline muted className="footer-video" />
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
          <div className="footer-copyright">Copyrights © 2026 Cognitude. All Rights Reserved</div>
        </div>
      </footer>
    </div>

  )
}

export default App