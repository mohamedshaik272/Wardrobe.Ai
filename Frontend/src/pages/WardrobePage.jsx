import { useState } from 'react';
import './WardrobePage.css';

function WardrobePage({ onNavigate, userPlan = 'free' }) {
  const [closets, setClosets] = useState([
    { id: 1, name: 'Work Wardrobe', itemCount: 0, color: '#1e91d6' },
    { id: 2, name: 'Casual Wear', itemCount: 0, color: '#8fc93a' },
  ]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClosetName, setNewClosetName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#1e91d6');

  const maxClosets = userPlan === 'free' ? 4 : Infinity;
  const canCreateMore = closets.length < maxClosets;

  // Updated color palette
  const colors = ['#1e91d6', '#0072bb', '#8fc93a', '#e4cc37', '#e18335', '#ff6b9d'];

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
      setSelectedColor('#1e91d6');
    }
  };

  const handleDeleteCloset = (id) => {
    if (window.confirm('Are you sure you want to delete this closet?')) {
      setClosets(closets.filter(closet => closet.id !== id));
    }
  };

  const handleOpenCloset = (closet) => {
    onNavigate('closet', closet);
  };

  return (
    <div className="wardrobe-page">
      {/* Header */}
      <div className="wardrobe-header">
        <div className="header-content">
          <button className="back-btn" onClick={() => onNavigate('home')}>
            ← Back to Home
          </button>
          <h1>My Wardrobe</h1>
          <div className="plan-badge">
            {userPlan === 'free' ? (
              <span className="free-plan">
                Free Plan: {closets.length}/{maxClosets} Closets
              </span>
            ) : (
              <span className="premium-plan">Premium Plan ✨</span>
            )}
          </div>
        </div>
      </div>

      {/* Closets Grid */}
      <div className="wardrobe-content">
        <div className="closets-container">
          {closets.map((closet) => (
            <div 
              key={closet.id} 
              className="closet-item"
              style={{ borderColor: closet.color }}
            >
              <div 
                className="closet-content"
                onClick={() => handleOpenCloset(closet)}
              >
                <div 
                  className="closet-icon-large"
                  style={{ background: closet.color }}
                >
                  👔
                </div>
                <h3>{closet.name}</h3>
                <p className="item-count">{closet.itemCount} items</p>
              </div>
              <button 
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteCloset(closet.id);
                }}
              >
                🗑️
              </button>
            </div>
          ))}

          {/* Create New Closet Card */}
          {canCreateMore && !showCreateForm && (
            <div 
              className="closet-item create-new"
              onClick={() => setShowCreateForm(true)}
            >
              <div className="create-icon">+</div>
              <h3>Create New Closet</h3>
              <p>Add a new collection</p>
            </div>
          )}

          {/* Create Form */}
          {showCreateForm && (
            <div className="closet-item create-form">
              <form onSubmit={handleCreateCloset}>
                <h3>New Closet</h3>
                <input
                  type="text"
                  placeholder="Closet name..."
                  value={newClosetName}
                  onChange={(e) => setNewClosetName(e.target.value)}
                  className="closet-name-input"
                  autoFocus
                  maxLength={30}
                />
                
                <div className="color-picker">
                  <label>Choose a color:</label>
                  <div className="color-options">
                    {colors.map((color) => (
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
        </div>

        {/* Upgrade CTA for Free Users */}
        {!canCreateMore && userPlan === 'free' && (
          <div className="upgrade-cta">
            <h3>🚀 Want more closets?</h3>
            <p>Upgrade to Premium for unlimited closets and more features!</p>
            <button className="upgrade-btn" onClick={() => onNavigate('home')}>
              Upgrade to Premium
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default WardrobePage;