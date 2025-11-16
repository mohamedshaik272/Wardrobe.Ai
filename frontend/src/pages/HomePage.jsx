import { useState, useEffect } from "react";
import "./HomePage.css";

function HomePage({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="home-page">
      {/* Navigation Bar */}
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-content">
          <div className="logo">Wardrobe.AI</div>
          <div className="nav-links">
            <button
              className="nav-btn primary"
              onClick={() => onNavigate("wardrobe")}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Screen */}
      <section className="hero-fullscreen">
        <div className="hero-text-container">
          <h1 className="hero-title">
            Your Personal
            <br />
            Stylist
          </h1>
          <p className="hero-tagline">
            Creating personalized wardrobe with and for you to define
            <br />
            the future of your style
          </p>
        </div>
        <div className="scroll-indicator">
          <span>Scroll to explore</span>
          <div className="scroll-line"></div>
        </div>
      </section>

      {/* Statement Section */}
      <section className="statement-section">
        <div className="statement-content">
          <h2 className="statement-text">
            Wardrobe.AI is a new approach to personal styling through AI-powered
            recommendations and curated collections.
          </h2>
        </div>
      </section>

      {/* Image + Text Section */}
      <section className="image-text-section">
        <div className="image-container">
          <img
            src="/fashion-curation.jpg"
            alt="Fashion curation"
            className="section-image"
          />
        </div>
        <div className="text-content">
          <h3 className="section-heading">Thoughtful Curation</h3>
          <p className="section-description">
            We don't just recommend clothes, we use AI to understand your style,
            preferences, and needs to create authentic wardrobes that reflect
            who you are.
          </p>
        </div>
      </section>

      {/* Features Grid - Minimal */}
      <section className="features-minimal">
        <div className="feature-item">
          <h3>AI-Powered Chat</h3>
          <p>
            Conversational styling that understands your aesthetic, budget, and
            lifestyle to provide personalized recommendations.
          </p>
        </div>
        <div className="feature-item">
          <h3>Visual Inspiration</h3>
          <p>
            Upload photos of styles you love and our AI analyzes colors,
            patterns, and aesthetics to find similar pieces.
          </p>
        </div>
        <div className="feature-item">
          <h3>Smart Collections</h3>
          <p>
            Organize multiple closets for work, leisure, and special occasions
            with seamless management and curation.
          </p>
        </div>
        <div className="feature-item">
          <h3>Curated Shopping</h3>
          <p>
            Every recommendation includes links to reputable retailers with
            price comparisons across trusted shopping sites.
          </p>
        </div>
      </section>

      {/* Gallery Section - Modern Stacked Cards */}
      <section className="gallery-modern">
        <div className="gallery-grid">
          {/* Elegant & Formal */}
          <div className="style-card">
            <h3 className="style-title">Elegant & Formal</h3>
            <p className="style-description">
              Clean, structured pieces designed for elevated events and
              sophisticated moments.
            </p>
            <div className="carousel-container">
              <div className="carousel-left-subcontainer">
                <img src="/picture5.jpg" alt="Elegant style 1" />
                <img src="/picture6.jpg" alt="Elegant style 2" />
                <img src="/picture7.jpg" alt="Elegant style 3" />
                <img src="/picture5.jpg" alt="Elegant style 1" />
                <img src="/picture6.jpg" alt="Elegant style 2" />
              </div>
              <div className="carousel-right-subcontainer">
                <img src="/picture19.jpg" alt="Elegant style 4" />
                <img src="/picture20.jpg" alt="Elegant style 5" />
                <img src="/picture21.jpg" alt="Elegant style 3" />
                <img src="/picture23.jpg" alt="Elegant style 4" />
                <img src="/picture24.jpg" alt="Elegant style 5" />
              </div>
            </div>
          </div>

          {/* Casual & Comfortable */}
          <div className="style-card">
            <h3 className="style-title">Casual & Comfortable</h3>
            <p className="style-description">
              Laid‑back everyday looks built around softness, simplicity, and
              effortless wear.
            </p>
            <div className="carousel-container">
              <div className="carousel-left-subcontainer">
                <img src="/picture2.jpg" alt="Casual style 1" />
                <img src="/picture4.jpg" alt="Casual style 2" />
                <img src="/picture12.jpg" alt="Casual style 3" />
                <img src="/picture28.jpg" alt="Casual style 4" />
                <img src="/picture29.jpg" alt="Casual style 5" />
              </div>
              <div className="carousel-right-subcontainer">
                <img src="/picture15.jpg" alt="Casual style 6" />
                <img src="/picture16.jpg" alt="Casual style 7" />
                <img src="/picture25.jpg" alt="Casual style 8" />
                <img src="/picture26.jpg" alt="Casual style 9" />
                <img src="/picture27.jpg" alt="Casual style 10" />
              </div>
            </div>
          </div>

          {/* Athletic Wear */}
          <div className="style-card">
            <h3 className="style-title">Athletic Wear</h3>
            <p className="style-description">
              High‑performance fits crafted for movement, comfort, and active
              lifestyles.
            </p>
            <div className="carousel-container">
              <div className="carousel-left-subcontainer">
                <img src="/picture3.jpg" alt="Athletic style 1" />
                <img src="/picture9.jpg" alt="Athletic style 2" />
                <img src="/picture10.jpg" alt="Athletic style 3" />
                <img src="/picture3.jpg" alt="Athletic style 1" />
                <img src="/picture9.jpg" alt="Athletic style 2" />
              </div>
              <div className="carousel-right-subcontainer">
                <img src="/picture11.jpg" alt="Athletic style 4" />
                <img src="/picture17.jpg" alt="Athletic style 5" />
                <img src="/picture18.jpg" alt="Athletic style 6" />
                <img src="/picture11.jpg" alt="Athletic style 4" />
                <img src="/picture17.jpg" alt="Athletic style 5" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Approach Section */}
      <section className="approach-section">
        <div className="approach-content">
          <h2 className="approach-title">Our Approach</h2>
          <div className="approach-grid">
            <div className="approach-item">
              <h4>Listen</h4>
              <p>
                We understand your style preferences, body type, and lifestyle
                through natural conversation.
              </p>
            </div>
            <div className="approach-item">
              <h4>Analyze</h4>
              <p>
                Our AI processes your inputs, uploaded images, and preferences
                to build your unique style profile.
              </p>
            </div>
            <div className="approach-item">
              <h4>Curate</h4>
              <p>
                We generate personalized recommendations filtered by price,
                brand, purpose, and aesthetics.
              </p>
            </div>
            <div className="approach-item">
              <h4>Evolve</h4>
              <p>
                Your wardrobe grows and adapts as we learn more about your style
                over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Large */}
      <section className="cta-large">
        <h2 className="cta-heading">
          Ready to transform
          <br />
          your wardrobe?
        </h2>
        <button
          className="cta-button-large"
          onClick={() => onNavigate("wardrobe")}
        >
          Start Building Your Style
        </button>
      </section>
    </div>
  );
}

export default HomePage;