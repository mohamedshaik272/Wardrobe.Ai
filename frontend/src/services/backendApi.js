const API_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:8000';

export const backendApi = {
  async clothingTryOn(personImage, clothingImage, options = {}) {
    const formData = new FormData();
    formData.append('person_image', personImage);
    formData.append('clothing_image', clothingImage);
    formData.append('garment_description', options.garmentDescription || 'A clothing item');
    formData.append('auto_mask', options.autoMask !== undefined ? options.autoMask : true);
    formData.append('auto_crop', options.autoCrop || false);
    formData.append('denoise_steps', options.denoiseSteps || 30);
    formData.append('seed', options.seed || 42);

    const response = await fetch(`${API_URL}/api/clothing/try-on`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Clothing try-on failed');
    }

    return response.json();
  },

  async checkHealth() {
    const response = await fetch(`${API_URL}/api/health`);
    if (!response.ok) {
      throw new Error('Health check failed');
    }
    return response.json();
  },

  getResultImageUrl(resultPath) {
    // Handle both absolute URLs and relative paths
    if (resultPath.startsWith('http')) {
      return resultPath;
    }
    // Remove leading slash if present
    const cleanPath = resultPath.startsWith('/') ? resultPath.substring(1) : resultPath;
    return `${API_URL}/${cleanPath}`;
  }
};
