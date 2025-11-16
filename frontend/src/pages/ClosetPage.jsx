import { useState } from "react";
import "./ClosetPage.css";

function ClosetPage({ closet, onNavigate }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      text: `Hi! I'm your AI stylist. I'll help you find clothes for your "${closet.name}" collection. Tell me what you're looking for!`,
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [preferences, setPreferences] = useState({
    minPrice: "",
    maxPrice: "",
    brands: "",
    purpose: "casual",
    size: "",
    itemCount: 5,
  });
  const [generatedItems, setGeneratedItems] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Mock shopping links for demonstration
  const mockShoppingLinks = [
    { store: "Amazon Fashion", url: "#", price: "$29.99" },
    { store: "Nordstrom", url: "#", price: "$34.99" },
    { store: "ASOS", url: "#", price: "$27.50" },
    { store: "Zara", url: "#", price: "$32.00" },
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const userMessage = {
        id: Date.now(),
        type: "user",
        text: inputMessage,
      };

      setMessages([...messages, userMessage]);

      // Simulate AI response
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      id: Date.now() + Math.random(),
      url: URL.createObjectURL(file),
      name: file.name,
    }));
    setUploadedImages([...uploadedImages, ...newImages]);

    // Add AI message about uploaded images
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

  const handleGenerate = () => {
    setIsGenerating(true);

    // Simulate API call
    setTimeout(() => {
      const mockItems = Array.from(
        { length: preferences.itemCount },
        (_, i) => ({
          id: Date.now() + i,
          name: `Stylish ${preferences.purpose} wear ${i + 1}`,
          image: `https://via.placeholder.com/300x400/667eea/ffffff?text=Item+${
            i + 1
          }`,
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
      {/* Header */}
      <div className="closet-header">
        <button className="back-btn" onClick={() => onNavigate("wardrobe")}>
          ← Back to Wardrobe
        </button>
        <h1>{closet.name}</h1>
      </div>

      <div className="closet-layout">
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

        {/* Right Panel - Preferences & Generation */}
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
                <option value="casual">Casual/Leisure</option>
                <option value="athletic">Athletic</option>
                <option value="formal">Formal</option>
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
                    className="item-card"
                    onClick={() => setSelectedItem(item)}
                  >
                    <img src={item.image} alt={item.name} />
                    <div className="item-info">
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

      {/* Shopping Links Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelectedItem(null)}
            >
              ×
            </button>
            <h2>{selectedItem.name}</h2>
            <img
              src={selectedItem.image}
              alt={selectedItem.name}
              className="modal-image"
            />
            <p className="modal-description">{selectedItem.description}</p>

            <h3>Shop This Item</h3>
            <div className="shopping-links">
              {mockShoppingLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className="shopping-link"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="store-name">{link.store}</span>
                  <span className="store-price">{link.price}</span>
                  <span className="arrow">→</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClosetPage;
