const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

export const googleSearchService = {
  async getShoppingResults(query) {
    try {
      const response = await fetch(`${API_URL}/api/search?query=${encodeURIComponent(query)}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to get search results');
      }
      const data = await response.json();
      return data.results;
    } catch (error) {
      console.error('Google Search API Error:', error);
      throw error;
    }
  }
};
