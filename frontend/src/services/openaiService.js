const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

export const openaiService = {
  async getChatResponse(messages, context = {}) {
    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          context
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Failed to get AI response');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('AI Chat API Error:', error);
      throw error;
    }
  },

  async analyzeImage(imageUrl, prompt) {
    try {
      const response = await fetch(`${API_URL}/api/ai/analyze-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: imageUrl,
          prompt
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Failed to analyze image');
      }

      const data = await response.json();
      return data.analysis;
    } catch (error) {
      console.error('Image analysis error:', error);
      throw error;
    }
  },

  async generateClothingRecommendations(preferences) {
    try {
      const response = await fetch(`${API_URL}/api/ai/recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || 'Failed to generate recommendations');
      }

      const data = await response.json();
      return data.recommendations;
    } catch (error) {
      console.error('Recommendation Generation Error:', error);
      throw error;
    }
  }
};
