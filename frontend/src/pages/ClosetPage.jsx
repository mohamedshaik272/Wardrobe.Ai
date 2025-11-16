import { useState, useEffect } from "react";
import "./ClosetPage.css";
import { X } from "lucide-react"; // ADDED: Import Lucide X icon

function ClosetPage({ onNavigate, closetData }) {
  const [scrolled, setScrolled] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [closetCount] = useState(3); // Mock closet count
  
  // Chat state
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      text: `Hi! I'm your AI stylist for "${closetData?.name}". Tell me what you're looking for!`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  
  // Upload state
  const [uploadedImages, setUploadedImages] = useState([]);
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    minPrice: "",
    maxPrice: "",
    brands: "",
    purpose: closetData?.type || "Casual/Leisure",
    size: "",
    itemCount: 5,
  });
  
  // Generated items state
  const [generatedItems, setGeneratedItems] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Handle scroll for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mock clothing items for closet container
  const clothingItems = Array.from(
    { length: parseInt(closetData?.itemCount) || 12 },
    (_, i) => ({
      id: i + 1,
      name: `Clothing Item ${i + 1}`,
      category: ["Tops", "Bottoms", "Outerwear", "Shoes"][i % 4],
      color: ["Black", "White", "Blue", "Gray", "Red"][i % 5],
      size: ["XS", "S", "M", "L", "XL"][i % 5],
      description: "A versatile piece that fits perfectly into any wardrobe. Made with premium materials for comfort and style.",
      image: `https://via.placeholder.com/400x500/667eea/ffffff?text=Item+${i + 1}`,
    })
  );

  // Handle item selection
  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  // Close detail panel
  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  // Chat handlers
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const userMessage = {
        id: Date.now(),
        type: "user",
        text: inputMessage,
      };

      setMessages([...messages, userMessage]);

      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          type: "ai",
          text: generateAIResponse(inputMessage),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);

      setInputMessage("");
    }
  };

  const generateAIResponse = (userInput) => {
    const responses = [
      "Great choice! I can help you find that. What's your budget range?",
      "I understand your style preference. Would you like to see options from specific brands?",
      "Perfect! Let me know your size and I'll generate some recommendations.",
      "That sounds wonderful! Are you looking for casual, athletic, or formal wear?",
      "Excellent taste! I'll find the best options for you. Any color preferences?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  // Image upload handlers
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setUploadedImages([...uploadedImages, ...newImages]);

    const aiMessage = {
      id: Date.now(),
      type: "ai",
      text: `I see you've uploaded ${files.length} image(s)! I'll analyze the style and find similar options for you.`,
    };
    setMessages([...messages, aiMessage]);
  };

  const handleRemoveImage = (id) => {
    setUploadedImages(uploadedImages.filter((img) => img.id !== id));
  };

  // Generate recommendations
  const handleGenerate = () => {
    setIsGenerating(true);

    setTimeout(() => {
      const mockItems = Array.from(
        { length: preferences.itemCount },
        (_, i) => ({
          id: Date.now() + i,
          name: `Stylish ${preferences.purpose} wear ${i + 1}`,
          image: `https://via.placeholder.com/300x400/0072bb/ffffff?text=Item+${i + 1}`,
          price: `$${(Math.random() * 50 + 20).toFixed(2)}`,
          brand: preferences.brands || "Various Brands",
          description: `Perfect for ${preferences.purpose} occasions`,
        })
      );

      setGeneratedItems(mockItems);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="closet-page">
      {/* Navigation Bar - EXACT MATCH to WardrobePage */}
      <nav className={`navbar always-white ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-content">
          <div className="logo" onClick={() => onNavigate("home")}>
            Wardrobe.AI
          </div>
          <div className="nav-links">
            <button
              className="nav-btn primary"
              onClick={() => onNavigate("wardrobe")}
            >
              Back to Wardrobe
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="closet-main-wrapper">
        {/* Hero Header Section */}
        <section className="closet-hero-section">
          <div className="closet-hero-content">
            <h1 className="closet-page-title">{closetData?.name || "My Closet"}</h1>
            <div className="closet-meta-info">
              <span className="meta-badge">{closetData?.type || "Casual"}</span>
              <span className="meta-count">{closetData?.itemCount || clothingItems.length} items</span>
            </div>
          </div>
        </section>

        {/* Two Panel Layout - Left and Right */}
        <section className="two-panel-section">
          <div className="two-panel-container">
            {/* Left Panel - Chat & Upload */}
            <div className="left-panel">
              {/* Chat Section */}
              <div className="chat-section">
                <h2>AI Stylist Chat</h2>
                <div className="chat-messages">
                  {messages.map((message) => (
                    <div key={message.id} className={`message ${message.type}`}>
                      <div className="message-content">
                        {message.type === "ai" && (
                          <span className="ai-icon">🤖</span>
                        )}
                        <p>{message.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSendMessage} className="chat-input-form">
                  <input
                    type="text"
                    placeholder="Describe what you're looking for..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="chat-input"
                  />
                  <button type="submit" className="send-btn">
                    Send
                  </button>
                </form>
              </div>

              {/* Image Upload Section */}
              <div className="upload-section">
                <h3>Upload Inspiration</h3>
                <div className="upload-area">
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="image-upload" className="upload-label">
                    <div className="upload-icon">📸</div>
                    <p>Click to upload images</p>
                  </label>
                </div>

                {uploadedImages.length > 0 && (
                  <div className="uploaded-images">
                    {uploadedImages.map((image) => (
                      <div key={image.id} className="uploaded-image">
                        <img src={image.url} alt={image.name} />
                        <button
                          className="remove-image-btn"
                          onClick={() => handleRemoveImage(image.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Preferences & Generated Items */}
            <div className="right-panel">
              {/* Preferences Section */}
              <div className="preferences-section">
                <h2>Preferences</h2>

                <div className="preference-group">
                  <label>Price Range</label>
                  <div className="price-inputs">
                    <input
                      type="number"
                      placeholder="Min ($)"
                      value={preferences.minPrice}
                      onChange={(e) =>
                        setPreferences({ ...preferences, minPrice: e.target.value })
                      }
                      className="price-input"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max ($)"
                      value={preferences.maxPrice}
                      onChange={(e) =>
                        setPreferences({ ...preferences, maxPrice: e.target.value })
                      }
                      className="price-input"
                    />
                  </div>
                </div>

                <div className="preference-group">
                  <label>Brands (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., Nike, Adidas, Zara"
                    value={preferences.brands}
                    onChange={(e) =>
                      setPreferences({ ...preferences, brands: e.target.value })
                    }
                    className="text-input"
                  />
                </div>

                <div className="preference-group">
                  <label>Purpose</label>
                  <select
                    value={preferences.purpose}
                    onChange={(e) =>
                      setPreferences({ ...preferences, purpose: e.target.value })
                    }
                    className="select-input"
                  >
                    <option value="Casual/Leisure">Casual/Leisure</option>
                    <option value="Athletic">Athletic</option>
                    <option value="Formal">Formal</option>
                    <option value="Work">Work</option>
                    <option value="Seasonal">Seasonal</option>
                  </select>
                </div>

                <div className="preference-group">
                  <label>Size</label>
                  <input
                    type="text"
                    placeholder="e.g., M, L, XL"
                    value={preferences.size}
                    onChange={(e) =>
                      setPreferences({ ...preferences, size: e.target.value })
                    }
                    className="text-input"
                  />
                </div>

                <div className="preference-group">
                  <label>Number of Items to Generate</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={preferences.itemCount}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        itemCount: parseInt(e.target.value),
                      })
                    }
                    className="number-input"
                  />
                </div>

                <button
                  className="generate-btn"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? "Generating..." : "✨ Generate Recommendations"}
                </button>
              </div>

              {/* Generated Items Section */}
              {generatedItems.length > 0 && (
                <div className="generated-section">
                  <h2>Your Recommendations</h2>
                  <div className="items-grid">
                    {generatedItems.map((item) => (
                      <div
                        key={item.id}
                        className="generated-item-card"
                        onClick={() => setSelectedItem(item)}
                      >
                        <img src={item.image} alt={item.name} />
                        <div className="generated-item-info">
                          <h4>{item.name}</h4>
                          <p className="item-price">{item.price}</p>
                          <p className="item-brand">{item.brand}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Closet Container - Bottom Section */}
        <section className="closet-container-section">
          <div className="closet-container">
            <div className="closet-container-header">
              <h2>Your Items</h2>
              <button className="add-item-button">+ Add Item</button>
            </div>

            <div className="clothing-items-grid">
              {clothingItems.map((item) => (
                <div
                  key={item.id}
                  className="clothing-item-card"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="item-image-wrapper">
                    <img src={item.image} alt={item.name} />
                    <div className="item-hover-overlay">
                      <span>View Details</span>
                    </div>
                  </div>
                  <div className="item-card-info">
                    <h4>{item.name}</h4>
                    <p className="item-category">{item.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Detail Panel - Slides in from right */}
      {selectedItem && (
        <>
          <div className="detail-panel-overlay" onClick={handleCloseDetail} />
          <div className={`detail-panel ${selectedItem ? "active" : ""}`}>
           
            <div className="detail-panel-content">
              <div className="detail-image-section">
                <img src={selectedItem.image} alt={selectedItem.name} />
              </div>

              <div className="detail-info-section">
                <h2>{selectedItem.name}</h2>
                
                <div className="detail-meta-grid">
                  <div className="detail-meta-item">
                    <span className="meta-label">Category</span>
                    <span className="meta-value">{selectedItem.category}</span>
                  </div>
                  <div className="detail-meta-item">
                    <span className="meta-label">Color</span>
                    <span className="meta-value">{selectedItem.color}</span>
                  </div>
                  <div className="detail-meta-item">
                    <span className="meta-label">Size</span>
                    <span className="meta-value">{selectedItem.size}</span>
                  </div>
                  {selectedItem.price && (
                    <div className="detail-meta-item">
                      <span className="meta-label">Price</span>
                      <span className="meta-value">{selectedItem.price}</span>
                    </div>
                  )}
                </div>

                <div className="detail-description">
                  <h3>Description</h3>
                  <p>{selectedItem.description}</p>
                </div>

                <div className="detail-actions">
                  <button className="action-btn edit-btn">Edit Item</button>
                  <button className="action-btn remove-btn">Remove</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export default ClosetPage;