import { useState } from 'react';
import './HomePage.css';

function HomePage({ onNavigate }) {
  return (
    <div className="home-page">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo">Wardrobe.AI</div>
          <div className="nav-links">
            <button className="nav-btn primary" onClick={() => onNavigate('wardrobe')}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="main-title">Your Personal AI Stylist</h1>
          <p className="main-subtitle">
            Build your digital wardrobe, chat with AI about your style, and discover 
            perfect outfits tailored to your preferences
          </p>
          <button 
            className="hero-cta" 
            onClick={() => onNavigate('wardrobe')}
          >
            Start Building Your Wardrobe
          </button>
        </div>
        <div className="hero-visual">
          <div className="visual-card">👔</div>
          <div className="visual-card">👗</div>
          <div className="visual-card">👟</div>
          <div className="visual-card">👜</div>
        </div>
      </section>

      {/* What You Can Do Section */}
      <section className="capabilities-section">
        <h2 className="section-title">What You Can Do</h2>
        <div className="capabilities-grid">
          <div className="capability-card">
            <div className="capability-icon">🗂️</div>
            <h3>Create Multiple Closets</h3>
            <p>
              Organize your wardrobe into different collections - work clothes, 
              casual wear, formal attire, and more
            </p>
            <span className="capability-badge">Free: 4 closets | Premium: Unlimited</span>
          </div>

          <div className="capability-card">
            <div className="capability-icon">💬</div>
            <h3>Chat with AI Stylist</h3>
            <p>
              Describe your style preferences, occasion, budget, and favorite brands. 
              Our AI understands your needs
            </p>
            <span className="capability-badge">Powered by AI</span>
          </div>

          <div className="capability-card">
            <div className="capability-icon">📸</div>
            <h3>Upload Inspiration</h3>
            <p>
              Share photos of styles you love. Our AI analyzes the aesthetics 
              and finds similar options for you
            </p>
            <span className="capability-badge">Image Recognition</span>
          </div>

          <div className="capability-card">
            <div className="capability-icon">✨</div>
            <h3>Get Personalized Recommendations</h3>
            <p>
              Specify price range, brands, purpose, size, and aesthetics. 
              Generate curated clothing options instantly
            </p>
            <span className="capability-badge">Smart Matching</span>
          </div>

          <div className="capability-card">
            <div className="capability-icon">🛍️</div>
            <h3>Shop from Trusted Retailers</h3>
            <p>
              Click any recommended item to see purchase links from reputable 
              online shopping websites
            </p>
            <span className="capability-badge">Multi-Store Search</span>
          </div>

          <div className="capability-card">
            <div className="capability-icon">🎯</div>
            <h3>Filter by Your Needs</h3>
            <p>
              Filter by athletics, casual/leisure, or formal wear. Set your budget 
              and preferred brands for precise results
            </p>
            <span className="capability-badge">Advanced Filters</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-container">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Create Your Closets</h3>
            <p>Set up different collections for different occasions</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Chat & Upload</h3>
            <p>Tell our AI what you're looking for or upload inspiration photos</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Generate Options</h3>
            <p>Specify how many items you want and let AI curate your choices</p>
          </div>
          <div className="step-arrow">→</div>
          <div className="step">
            <div className="step-number">4</div>
            <h3>Shop & Save</h3>
            <p>Browse recommendations and shop from trusted retailers</p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <h2 className="section-title">Choose Your Plan</h2>
        <div className="pricing-cards">
          <div className="pricing-card">
            <h3>Free</h3>
            <div className="price">$0<span>/month</span></div>
            <ul className="features-list">
              <li>✓ Up to 4 closets</li>
              <li>✓ AI chat stylist</li>
              <li>✓ Image upload</li>
              <li>✓ 10 generations/month</li>
              <li>✓ Shopping links</li>
            </ul>
            <button className="pricing-btn secondary" onClick={() => onNavigate('wardrobe')}>
              Get Started
            </button>
          </div>

          <div className="pricing-card premium">
            <div className="popular-badge">Most Popular</div>
            <h3>Premium</h3>
            <div className="price">$9.99<span>/month</span></div>
            <ul className="features-list">
              <li>✓ Unlimited closets</li>
              <li>✓ AI chat stylist</li>
              <li>✓ Image upload</li>
              <li>✓ Unlimited generations</li>
              <li>✓ Shopping links</li>
              <li>✓ Priority support</li>
              <li>✓ Advanced filters</li>
            </ul>
            <button className="pricing-btn primary" onClick={() => onNavigate('wardrobe')}>
              Upgrade Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2024 Wardrobe.AI - Your Personal AI Stylist</p>
      </footer>
    </div>
  );
}

export default HomePage;