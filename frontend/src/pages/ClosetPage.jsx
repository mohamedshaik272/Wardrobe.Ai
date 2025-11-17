import { useState, useEffect } from "react";
import "./ClosetPage.css";
import { backendApi } from "../services/backendApi";
import { openaiService } from "../services/openaiService";

function ClosetPage({ onNavigate, closetData }) {
  const [scrolled, setScrolled] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "ai",
      text: "Hi! I am your personal AI Stylist. Ask me to help you create a new wardrobe, find a specific item, or give you fashion advice!",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // State for user's closet items
  const [closetItems, setClosetItems] = useState([]);

  const [preferences, setPreferences] = useState({
    minPrice: "",
    maxPrice: "",
    brands: "",
    purpose: closetData?.type || "Casual/Leisure",
    size: "",
    itemCount: 5,
  });

  const [generatedItems, setGeneratedItems] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [tryOnMode, setTryOnMode] = useState("clothing");
  const [tryOnImages, setTryOnImages] = useState({
    person: null,
    clothing: null,
  });
  const [tryOnResult, setTryOnResult] = useState(null);
  const [isTryOnLoading, setIsTryOnLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [closetData]);

  // Handle adding items to closet
  const handleAddItemToCloset = (e) => {
    const files = Array.from(e.target.files);
    const newItems = files.map((file) => ({
      id: Date.now() + Math.random(),
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
      image: URL.createObjectURL(file),
      file: file,
      category: "Clothing",
    }));
    setClosetItems([...closetItems, ...newItems]);
  };

  const handleRemoveItemFromCloset = (id) => {
    setClosetItems(closetItems.filter((item) => item.id !== id));
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isChatLoading) {
      const userMessage = {
        id: Date.now(),
        type: "user",
        text: inputMessage,
      };

      setMessages([...messages, userMessage]);
      setInputMessage("");
      setIsChatLoading(true);

      try {
        const context = {
          closetName: closetData?.name,
          closetType: closetData?.type,
          preferences: preferences,
        };

        const aiResponse = await openaiService.getChatResponse(
          [...messages, userMessage],
          context
        );

        const aiMessage = {
          id: Date.now() + 1,
          type: "ai",
          text: aiResponse,
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        const errorMessage = {
          id: Date.now() + 1,
          type: "ai",
          text: "Sorry, I encountered an error. Please try again.",
        };
        setMessages((prev) => [...prev, errorMessage]);
        console.error("Chat error:", error);
      } finally {
        setIsChatLoading(false);
      }
    }
  };


  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const recommendations = await openaiService.generateClothingRecommendations(preferences);
      setGeneratedItems(recommendations);
    } catch (error) {
      console.error("Failed to generate items:", error);
      // Optionally, show an error message to the user
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTryOnImageUpload = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      setTryOnImages({
        ...tryOnImages,
        [type]: {
          url: URL.createObjectURL(file),
          file: file,
        },
      });
    }
  };

  const handleVirtualTryOn = async () => {
    if (tryOnMode === "clothing") {
      if (!tryOnImages.person || !tryOnImages.clothing) {
        alert("Please upload both person and clothing images");
        return;
      }

      setIsTryOnLoading(true);
      try {
        const result = await backendApi.clothingTryOn(
          tryOnImages.person.file,
          tryOnImages.clothing.file
        );

        const imageUrl = backendApi.getResultImageUrl(result.result);
        setTryOnResult(imageUrl);
      } catch (error) {
        console.error("Try-on error:", error);
        alert(error.message || "Virtual try-on failed. Please try again.");
      } finally {
        setIsTryOnLoading(false);
      }
    }
  };
  return (
    <div className="closet-page">
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

      <div className="closet-main-wrapper">
        <section className="closet-hero-section">
          <div className="closet-hero-content">
            <h1 className="closet-page-title">{closetData?.name || "My Closet"}</h1>
            <div className="closet-meta-info">
              <span className="meta-badge">{closetData?.type || "Casual"}</span>
              <span className="meta-count">{closetItems.length} items</span>
            </div>
          </div>
        </section>

        {/* Full-Width Preferences Section */}
        <section className="preferences-section-full">
          <div className="preferences-container">
            <h2 className="section-title">Generate Recommendations</h2>
            <div className="preferences-form">
              <div className="preference-row">
                <div className="preference-group">
                  <label>Price Range</label>
                  <div className="price-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={preferences.minPrice}
                      onChange={(e) =>
                        setPreferences({ ...preferences, minPrice: e.target.value })
                      }
                      className="text-input price-input"
                    />
                    <span className="price-separator">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={preferences.maxPrice}
                      onChange={(e) =>
                        setPreferences({ ...preferences, maxPrice: e.target.value })
                      }
                      className="text-input price-input"
                    />
                  </div>
                </div>

                <div className="preference-group">
                  <label>Brands</label>
                  <input
                    type="text"
                    placeholder="e.g., Nike, Adidas"
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

                <div className="preference-group-button">
                  <button
                    className="generate-btn-large"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? "Generating..." : "✨ Generate"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recommendations Section */}
        {generatedItems.length > 0 && (
          <section className="recommendations-section-full">
            <div className="recommendations-container">
              <h2 className="section-title">Your Recommendations</h2>
              <div className="recommendations-grid">
                {generatedItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="recommendation-card"
                  >
                    <div className="recommendation-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="recommendation-info">
                      <h4>{item.name}</h4>
                      <p className="recommendation-price">{item.price}</p>
                      <p className="recommendation-brand">{item.brand}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="two-panel-section">
          <div className="two-panel-container">
            <div className="left-panel">
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
                  {isChatLoading && (
                    <div className="message ai">
                      <div className="message-content">
                        <span className="ai-icon">🤖</span>
                        <p>Thinking...</p>
                      </div>
                    </div>
                  )}
                </div>
                <form onSubmit={handleSendMessage} className="chat-input-form">
                  <input
                    type="text"
                    placeholder="Describe what you're looking for..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    className="chat-input"
                    disabled={isChatLoading}
                  />
                  <button type="submit" className="send-btn" disabled={isChatLoading}>
                    Send
                  </button>
                </form>
              </div>

            </div>

            <div className="right-panel">
              <div className="virtual-tryon-section">
                <h2>Virtual Try-On</h2>

                <div className="tryon-tabs">
                  <button
                    className={`tab-btn ${tryOnMode === "clothing" ? "active" : ""}`}
                    onClick={() => setTryOnMode("clothing")}
                  >
                    Clothing
                  </button>
                </div>

                {tryOnMode === "clothing" && (
                  <div className="tryon-content">
                    <div className="tryon-upload-grid">
                      <div className="tryon-upload-box">
                        <h4>Person Image</h4>
                        <input
                          type="file"
                          id="person-upload"
                          accept="image/*"
                          onChange={(e) => handleTryOnImageUpload("person", e)}
                          style={{ display: "none" }}
                        />
                        <label htmlFor="person-upload" className="tryon-upload-label">
                          {tryOnImages.person ? (
                            <img src={tryOnImages.person.url} alt="Person" />
                          ) : (
                            <div className="upload-placeholder">
                              <span>👤</span>
                              <p>Upload</p>
                            </div>
                          )}
                        </label>
                      </div>

                      <div className="tryon-upload-box">
                        <h4>Clothing Image</h4>
                        <input
                          type="file"
                          id="clothing-upload"
                          accept="image/*"
                          onChange={(e) => handleTryOnImageUpload("clothing", e)}
                          style={{ display: "none" }}
                        />
                        <label htmlFor="clothing-upload" className="tryon-upload-label">
                          {tryOnImages.clothing ? (
                            <img src={tryOnImages.clothing.url} alt="Clothing" />
                          ) : (
                            <div className="upload-placeholder">
                              <span>👕</span>
                              <p>Upload</p>
                            </div>
                          )}
                        </label>
                      </div>
                    </div>

                    <button
                      className="tryon-btn"
                      onClick={handleVirtualTryOn}
                      disabled={isTryOnLoading || !tryOnImages.person || !tryOnImages.clothing}
                    >
                      {isTryOnLoading ? "Processing..." : "✨ Try It On"}
                    </button>

                    {tryOnResult && (
                      <div className="tryon-result">
                        <h4>Result</h4>
                        <img src={tryOnResult} alt="Try-on result" />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="closet-container-section">
          <div className="closet-container">
            <div className="closet-container-header">
              <h2>Your Items</h2>
              <div className="header-actions">
                <input
                  type="file"
                  id="closet-item-upload"
                  accept="image/*"
                  multiple
                  onChange={handleAddItemToCloset}
                  style={{ display: "none" }}
                />
                <label htmlFor="closet-item-upload" className="add-item-button">
                  + Add Item
                </label>
              </div>
            </div>

            <div className="clothing-items-grid">
              {closetItems.length === 0 ? (
                <div className="empty-closet-message">
                  <p>Your closet is empty. Click "+ Add Item" to upload clothing images!</p>
                </div>
              ) : (
                closetItems.map((item) => (
                  <div key={item.id} className="clothing-item-card">
                    <button
                      className="remove-item-btn"
                      onClick={() => handleRemoveItemFromCloset(item.id)}
                      title="Remove item"
                    >
                      ×
                    </button>
                    <div
                      className="item-image-wrapper"
                      onClick={() => handleItemClick(item)}
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <div className="clothing-item-placeholder">
                          <span>👕</span>
                        </div>
                      )}
                      <div className="item-hover-overlay">
                        <span>View Details</span>
                      </div>
                    </div>
                    <div className="item-card-info">
                      <h4>{item.name}</h4>
                      <p className="item-category">{item.category}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

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
                  <button
                    className="action-btn remove-btn"
                    onClick={() => {
                      handleRemoveItemFromCloset(selectedItem.id);
                      handleCloseDetail();
                    }}
                  >
                    Remove from Closet
                  </button>
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
