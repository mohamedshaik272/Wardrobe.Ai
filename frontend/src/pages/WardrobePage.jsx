// WardrobePage.jsx

import { useState, useEffect } from 'react';
import './WardrobePage.css';

// --- Navbar Component (Adapted from HomePage.jsx) ---
// Updated to include the Add Closet button and counter
const Navbar = ({ onNavigate, onAddCloset, closetCount, canCreateMore }) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-content">
        <div className="logo" onClick={() => onNavigate('home')}>Wardrobe.AI</div>
        {/* New nav-links container to hold button and counter */}
        <div className="nav-links">
          <div className="closet-counter-pill">
            {closetCount}
          </div>
          <button
            className="nav-btn primary"
            onClick={onAddCloset}
            disabled={!canCreateMore}
            title={!canCreateMore ? "Max closets reached for your plan" : "Create New Closet"}
          >
            + Add Closet
          </button>
        </div>
      </div>
    </nav>
  );
};
// -------------------------

const initialClosets = [
  { id: 1, name: 'Work Wardrobe', itemCount: 45, color: '#1e91d6' },
  { id: 2, name: 'Weekend Casual', itemCount: 30, color: '#8fc93a' },
  { id: 3, name: 'Athletic Gear', itemCount: 15, color: '#e4cc37' },
];

function WardrobePage({ onNavigate, userPlan = 'free' }) {
  const [closets, setClosets] = useState(initialClosets);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClosetName, setNewClosetName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#1e91d6');

  const maxClosets = userPlan === 'free' ? 4 : Infinity;
  const canCreateMore = closets.length < maxClosets;

  const colors = ['#1e91d6', '#0072bb', '#8fc93a', '#e4cc37', '#e18335', '#ff6b9d'];

  const handleOpenCloset = (closet) => {
    onNavigate('closet', closet);
  };

  const handleCreateCloset = (e) => {
    e.preventDefault();
    if (newClosetName.trim() && canCreateMore) {
      const newCloset = {
        id: Date.now(),
        name: newClosetName,
        itemCount: 0,
        color: selectedColor
      };
      setClosets([...closets, newCloset]);
      setNewClosetName('');
      setShowCreateForm(false);
    }
  };

  // Function to pass to the navbar
  const handleAddClosetClick = () => {
    if (canCreateMore) {
      setShowCreateForm(true);
    }
  };

  // Component to render when there are no closets
  const EmptyState = () => (
    <div className="empty-state-container">
      <svg className="empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.8 1.1C18.1 0.4 17.1 0 16 0H8C6.9 0 5.9 0.4 5.2 1.1L0 6.3V21c0 1.7 1.3 3 3 3h18c1.7 0 3-1.3 3-3V6.3L18.8 1.1zM16 2h-8c-0.2 0-0.4 0.1-0.6 0.2L3.8 5h16.4l-3.6-2.8c-0.2-0.1-0.4-0.2-0.6-0.2zM22 21c0 0.6-0.4 1-1 1H3c-0.6 0-1-0.4-1-1V7h20v14zM12 10c-0.6 0-1 0.4-1 1v5c0 0.6 0.4 1 1 1s1-0.4 1-1v-5c0-0.6-0.4-1-1-1zM9 13c0 0.6 0.4 1 1 1h4c0.6 0 1-0.4 1-1s-0.4-1-1-1h-4c-0.6 0-1 0.4-1 1z"/>
      </svg>
      <h3>You have no closets yet.</h3>
      <p>Start by creating your first style collection to manage your items and launch your AI stylist.</p>
      {canCreateMore && (
        <button className="nav-btn primary empty-state-btn" onClick={handleAddClosetClick}>
          + Create My First Closet
        </button>
      )}
      {!canCreateMore && (
         <p className="max-closet-message">Maximum closets reached for your current plan. Please upgrade to create more.</p>
      )}
    </div>
  );

  return (
    <div className="wardrobe-page">
      <Navbar 
        onNavigate={onNavigate} 
        onAddCloset={handleAddClosetClick} 
        closetCount={closets.length} 
        canCreateMore={canCreateMore}
      />
      
      {/* Header/Banner Section - Takes up space below fixed navbar */}
      <div className="wardrobe-banner">
        <div className="banner-content">
          <h1>Your Digital Wardrobe</h1>
          <p className="tagline">Manage your style collections and launch your AI stylist.</p>
          <div className="plan-status">
            {userPlan === 'free' ? (
              <span className="status-badge">Free Plan ({closets.length} / {maxClosets} Closets)</span>
            ) : (
              <span className="status-badge premium">Premium Member</span>
            )}
          </div>
        </div>
      </div>

      <div className="wardrobe-main-content">
        <div className="wardrobe-actions">
          <h2>My Closets</h2> 
          {/* Hiding button here, as it is now in the fixed navbar */}
          {/* <button className="nav-btn primary" onClick={() => setShowCreateForm(true)}>+ Create New Closet</button> */}
        </div>

        {/* Create Closet Form/Modal */}
        {showCreateForm && (
          <div className="create-closet-form-container">
            <h3>Create a New Closet</h3>
            <form onSubmit={handleCreateCloset} className="create-closet-form">
              <div className="form-group">
                <label htmlFor="closetName">Closet Name</label>
                <input
                  id="closetName"
                  type="text"
                  placeholder="e.g., Spring Capsule"
                  value={newClosetName}
                  onChange={(e) => setNewClosetName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Accent Color</label>
                <div className="color-options">
                  {colors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                      style={{ background: color }}
                      onClick={() => setSelectedColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="form-buttons">
                <button type="submit" className="create-submit-btn">
                  Create
                </button>
                <button 
                  type="button" 
                  className="cancel-form-btn"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewClosetName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Conditional rendering of Closets Grid or Empty State */}
        {closets.length > 0 ? (
          <div className="closet-grid">
            {closets.map((closet) => (
              <div 
                key={closet.id} 
                className="closet-card"
                style={{ '--closet-color': closet.color }}
                onClick={() => handleOpenCloset(closet)}
              >
                <div className="card-header" style={{ backgroundColor: closet.color }}></div>
                <div className="card-content">
                  <h3 className="closet-name">{closet.name}</h3>
                  <p className="item-count">{closet.itemCount} Items</p>
                  <button className="view-btn">View Closet →</button>
                </div>
              </div>
            ))}
            
            {/* Upgrade CTA for Free Users - Remains in the grid */}
            {!canCreateMore && userPlan === 'free' && (
              <div className="upgrade-cta closet-card">
                <h3>🚀 Unlock More Closets</h3>
                <p>Upgrade to Premium for unlimited collections and more features!</p>
                <button className="nav-btn primary" onClick={() => onNavigate('home')}>
                  Go Premium
                </button>
              </div>
            )}
            
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

export default WardrobePage;