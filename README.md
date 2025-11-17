# Wardrobe.AI

Virtual try-on for hairstyles and clothing using AI models via Hugging Face APIs.

## Features

- **Clothing Virtual Try-On** - See how clothes look on you using IDM-VTON
- **AI Stylist Chat** - Get personalized fashion recommendations powered by OpenAI
- **Product Search** - Find clothing items using Google Custom Search API
- **No GPU Required** - All AI processing happens on cloud servers

## Features We Wanted to Implement (Future Work)
- **Hairstyle Transfer** - Try different hairstyles and colors using HairFastGAN

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/Wardrobe.Ai.git
cd Wardrobe.Ai
```

### 2. Set Up Environment Variables

Copy the example environment file and add your API keys:

```bash
# Single centralized .env file for the entire project
cp .env.example .env
```

Edit the `.env` file and add your API keys:

- **HF_TOKEN** (optional): Get from [Hugging Face](https://huggingface.co/settings/tokens)
- **GOOGLE_API_KEY**: Get from [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **CUSTOM_SEARCH_ENGINE_ID**: Get from [Programmable Search Engine](https://programmablesearchengine.google.com/)
- **OPENAI_API_KEY**: Get from [OpenAI Platform](https://platform.openai.com/api-keys)

### 3. Start the Backend

```bash
cd backend
pip install -r requirements.txt
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will run at `http://localhost:8000`

### 4. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run at `http://localhost:5173`

## Architecture

**v2.0.0** - API-Based Architecture

- **Backend**: FastAPI with Python
  - Hugging Face Gradio Client API for virtual try-on
  - Google Custom Search API for product discovery
  - OpenAI API for AI stylist features
- **Frontend**: React with Vite
- **Security**: All API keys stored in backend, never exposed to client

### Key Benefits

- No local model downloads required
- Lightweight dependencies (~50MB vs ~15GB previously)
- Works without GPU
- Secure API key management
- Easy deployment

### Models & Services

- **IDM-VTON** ([Space](https://huggingface.co/spaces/yisol/IDM-VTON)) - State-of-the-art clothing virtual try-on
- **OpenAI GPT-4o-mini** - AI fashion stylist and recommendations
- **Google Custom Search** - Product search and discovery

## API Endpoints

### Health Check

```bash
GET /api/health
```

Returns service health status.

### Clothing Virtual Try-On

```bash
POST /api/clothing/try-on
```

**Parameters:**
- `person_image` (file, required) - Image of the person
- `clothing_image` (file, required) - Image of the clothing item
- `garment_description` (string, optional) - Description of garment (default: "A clothing item")
- `auto_mask` (boolean, optional) - Use automatic masking (default: true)
- `auto_crop` (boolean, optional) - Auto-crop image (default: false)
- `denoise_steps` (integer, optional) - Number of denoising steps (default: 30)
- `seed` (integer, optional) - Random seed for reproducibility (default: 42)

**Response:**
```json
{
  "success": true,
  "result": "/files/generated/uuid.png",
  "message": "Virtual try-on completed successfully"
}
```

### Product Search

```bash
GET /api/search?query={search_query}&num_results={number}
```

**Parameters:**
- `query` (string, required) - Search query
- `num_results` (integer, optional) - Number of results (default: 10, max: 10)

**Response:**
```json
{
  "results": [
    {
      "id": "unique-url",
      "name": "Product Name",
      "description": "Product description",
      "image": "image-url",
      "price": "USD 50",
      "brand": "Brand Name",
      "link": "product-url"
    }
  ]
}
```

### AI Stylist Chat

```bash
POST /api/ai/chat
```

**Body:**
```json
{
  "messages": [
    {"type": "user", "text": "What should I wear to a beach party?"}
  ],
  "context": {
    "closetName": "Summer Wardrobe",
    "closetType": "Casual",
    "preferences": {}
  }
}
```

**Response:**
```json
{
  "response": "For a beach party, I recommend..."
}
```

### AI Image Analysis

```bash
POST /api/ai/analyze-image
```

**Body:**
```json
{
  "image_url": "https://example.com/image.jpg",
  "prompt": "Analyze this outfit"
}
```

**Response:**
```json
{
  "analysis": "This outfit features..."
}
```

### AI Clothing Recommendations

```bash
POST /api/ai/recommendations
```

**Body:**
```json
{
  "purpose": "work",
  "brands": "Nike, Adidas",
  "minPrice": "50",
  "maxPrice": "200",
  "size": "M"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "name": "Professional Blazer",
      "description": "A sleek blazer perfect for office wear",
      "price": "$80 - $120",
      "brand": "Hugo Boss",
      "image": "image-url",
      "link": "product-url"
    }
  ]
}
```

## Project Structure

```
Wardrobe.Ai/
├── backend/
│   ├── app/
│   │   ├── services/
│   │   │   ├── idm_vton_service.py      # Virtual try-on service
│   │   │   ├── google_search_service.py # Product search service
│   │   │   └── openai_service.py        # AI stylist service
│   │   ├── __init__.py
│   │   └── main.py                      # FastAPI application
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/                       # React pages
│   │   ├── services/                    # API service clients
│   │   └── ...
│   └── package.json
├── datasets/
│   ├── uploads/                         # User uploaded images
│   └── generated/                       # Generated try-on results
├── .env                                 # Single centralized environment file (not in git)
├── .env.example                         # Environment template
├── .gitignore
└── README.md
```

## Requirements

- **Python**: 3.10+
- **Node.js**: 18+
- **Internet Connection**: Required for API calls
- **API Keys**: See Environment Variables section
- **Disk Space**: ~500MB
- **GPU**: Not required

## Security Notes

- **Never commit `.env` files** - They contain sensitive API keys
- **API keys are stored in backend only** - Frontend never accesses them directly
- All API calls from frontend go through the backend proxy
- Use `.env.example` files as templates

## Development

### Backend Development

```bash
cd backend
# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
python3 -m uvicorn app.main:app --reload

# Access API docs
# http://localhost:8000/docs
```

### Frontend Development

```bash
cd frontend
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Troubleshooting

### Google Search Not Working

- Ensure `GOOGLE_API_KEY` is valid and has Custom Search API enabled
- Verify `CUSTOM_SEARCH_ENGINE_ID` is correct
- Check API quotas in Google Cloud Console

### OpenAI API Errors

- Verify `OPENAI_API_KEY` is valid
- Check API usage limits and billing in OpenAI dashboard
- Ensure the key has access to `gpt-4o-mini` model

### Virtual Try-On Slow

- First request may be slow as Hugging Face loads the model
- Consider getting a Hugging Face token for better rate limits
- Check internet connection speed

## License

This project is for educational purposes.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- [IDM-VTON](https://huggingface.co/spaces/yisol/IDM-VTON) for virtual try-on technology
- [OpenAI](https://openai.com/) for AI capabilities
- [Google Custom Search](https://developers.google.com/custom-search) for product discovery
