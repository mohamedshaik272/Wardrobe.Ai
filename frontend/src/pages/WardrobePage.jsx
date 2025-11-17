import { useState, useEffect } from "react";
import "./WardrobePage.css";

// List of image paths for the slideshow
const slideshowImages = [
  "/picture13.jpg",
  "/picture14.jpg",
  "/picture15.jpg",
  "/picture16.jpg",
  "/picture17.jpg",
  "/picture18.jpg",
];

function WardrobePage({ onNavigate }) {
  const [scrolled, setScrolled] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [closets, setClosets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newClosetData, setNewClosetData] = useState({
    name: "",
    type: ""
  });

  // Effect for the scrolling navbar background change and shrinking effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Calculate scroll progress for shrinking effect
      // Shrink over the first 50vh of scrolling
      const maxScroll = window.innerHeight * 0.5;
      const currentScroll = window.scrollY;
      const progress = Math.min(currentScroll / maxScroll, 1);
      setScrollProgress(progress);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Effect for the automatic image slideshow
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % slideshowImages.length
      );
    }, 5000); // Change image every 5 seconds (5000ms)

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  // Handle opening the modal
  const handleAddCloset = () => {
    setShowModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setNewClosetData({ name: "", type: "" });
  };

  // Handle input changes in the modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewClosetData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle creating a new closet
  const handleCreateCloset = () => {
    if (newClosetData.name && newClosetData.type) {
      const newCloset = {
        id: Date.now(),
        ...newClosetData
      };
      setClosets(prev => [...prev, newCloset]);
      handleCloseModal();

      // Navigate to the closet page with the new closet data
      onNavigate("closet", newCloset);
    } else {
      alert("Please fill in all fields");
    }
  };

  return (
    <div className="wardrobe-page">
      {/* Navigation Bar - Stays white and sharp */}
      <nav className={`navbar always-white ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-content">
          <div className="logo" onClick={() => onNavigate("home")}>
            Wardrobe.AI
          </div>
          <div className="nav-links">
            <button
              className="nav-btn primary"
              onClick={() => alert("Launching AI Stylist...")}
            >
              Launch Stylist
            </button>
          </div>
        </div>
      </nav>

      {/* Main Container for the Shrink Effect */}
      <div className="hero-scroll-wrapper">
        
        {/* Hero Section with Split Content */}
        <section 
          className="wardrobe-hero-split"
          style={{
            transform: `scale(${1 - scrollProgress * 0.15})`,
            opacity: 1 - scrollProgress * 0.3
          }}
        >
          
          {/* Left Column: Text Content (Closer to Navbar) */}
          <div className="hero-text-container-split">
            <h1 className="hero-title">Your Digital Wardrobe</h1>
            <p className="hero-tagline">
            Your style hub. Create and manage closets, organize your pieces, and access your AI stylist in one streamlined space.            
            </p>
          </div>

          {/* Right Column: Image Slideshow (Farther from Navbar) */}
          <div className="slideshow-container-split">
            {slideshowImages.map((image, index) => (
              <div
                key={index}
                className={`slide ${
                  index === currentImageIndex ? "active" : ""
                }`}
              >
                <img src={image} alt={`Wardrobe Slide ${index + 1}`} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Closet Grid Section */}
      <section className="closet-grid-section">
        <div className="closet-grid-container">
          <h2 className="grid-title">Your Closets</h2>
          
          <div className="closet-grid">
            {/* Add Closet Card */}
            <div className="closet-card add-closet-card" onClick={handleAddCloset}>
              <div className="add-closet-icon">+</div>
              <h3>Add Closet</h3>
            </div>

            {/* Existing Closets */}
            {closets.map(closet => (
              <div
                key={closet.id}
                className="closet-card"
                onClick={() => onNavigate("closet", closet)}
              >
                <div className="closet-card-content">
                  <h3>{closet.name}</h3>
                  <p className="closet-type">{closet.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal for Creating New Closet */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create New Closet</h2>
            
            <div className="modal-form">
              <div className="form-group">
                <label htmlFor="name">Closet Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newClosetData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Summer Collection"
                />
              </div>

              <div className="form-group">
                <label htmlFor="type">Closet Type</label>
                <select
                  id="type"
                  name="type"
                  value={newClosetData.type}
                  onChange={handleInputChange}
                >
                  <option value="">Select a type</option>
                  <option value="Casual/Leisure">Casual/Leisure</option>
                  <option value="Formal">Formal</option>
                  <option value="Athletics">Athletics</option>
                  <option value="Work">Work</option>
                  <option value="Seasonal">Seasonal</option>
                  <option value="Special Occasion">Special Occasion</option>
                </select>
              </div>

              <div className="modal-actions">
                <button className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button className="btn-create" onClick={handleCreateCloset}>
                  Create Closet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WardrobePage;