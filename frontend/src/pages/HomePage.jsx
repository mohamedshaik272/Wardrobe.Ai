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
          <img src="/hero-fashion.svg" alt="Fashion illustration" className="hero-image" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Everything You Need to Build Your Perfect Wardrobe</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <h3>Organize Your Closets</h3>
            <p>
              Create multiple collections for different occasions—work clothes, 
              casual wear, formal attire, and more. Keep everything organized and accessible.
            </p>
          </div>

          <div className="feature-card">
            <h3>AI-Powered Style Assistant</h3>
            <p>
              Chat naturally about your style preferences, occasions, and budget. 
              Our AI understands context and helps you find exactly what you're looking for.
            </p>
          </div>

          <div className="feature-card">
            <h3>Visual Inspiration</h3>
            <p>
              Upload photos of styles you love. Our AI analyzes the aesthetics, 
              colors, and patterns to find similar options that match your taste.
            </p>
          </div>

          <div className="feature-card">
            <h3>Smart Filtering</h3>
            <p>
              Set your price range, favorite brands, clothing purpose (athletic, casual, formal), 
              size preferences, and desired aesthetics for perfectly curated results.
            </p>
          </div>

          <div className="feature-card">
            <h3>Shop with Confidence</h3>
            <p>
              Every recommendation includes purchase links from reputable retailers. 
              Compare prices and options across multiple trusted shopping sites.
            </p>
          </div>

          <div className="feature-card">
            <h3>Personalized Recommendations</h3>
            <p>
              Get clothing suggestions tailored to your unique style, body type, 
              and preferences. Build a wardrobe that truly reflects who you are.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Create Your Closets</h3>
            <p>Set up different collections for work, leisure, sports, and special occasions</p>
          </div>

          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Share Your Vision</h3>
            <p>Chat with our AI or upload photos of styles you love</p>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Get Recommendations</h3>
            <p>Receive personalized clothing options based on your preferences</p>
          </div>

          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Shop & Build</h3>
            <p>Browse options, compare prices, and add to your digital wardrobe</p>
          </div>
        </div>
      </section>

      {/* Fashion Gallery */}
      <section className="gallery-section">
        <h2 className="section-title">Style for Every Occasion</h2>
        <div className="gallery-grid">
          <div className="gallery-item">
            <img src="/picture1.jpg" alt="Elegant dress" />
            <div className="gallery-label">Elegant & Formal</div>
          </div>
          <div className="gallery-item">
            <img src="/picture2.jpg" alt="Casual outfit" />
            <div className="gallery-label">Casual & Comfortable</div>
          </div>
          <div className="gallery-item">
            <img src="/picture3.jpg" alt="Atheltic attire" />
            <div className="gallery-label">Atheltic Wear</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Transform Your Wardrobe?</h2>
          <p>Start building your personalized clothing collection today</p>
          <button 
            className="cta-button" 
            onClick={() => onNavigate('wardrobe')}
          >
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">Wardrobe.AI</div>
            <p>Your personal AI-powered style assistant</p>
          </div>
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#pricing">Pricing</a>
            </div>
            <div className="footer-column">
              <h4>Company</h4>
              <a href="#about">About</a>
              <a href="#contact">Contact</a>
              <a href="#privacy">Privacy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Wardrobe.AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;