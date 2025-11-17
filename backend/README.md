# Wardrobe.AI Backend

FastAPI backend for Wardrobe.AI virtual try-on and AI styling application.

## Features

- **Virtual Try-On**: IDM-VTON integration via Hugging Face Gradio Client
- **AI Stylist**: OpenAI GPT-4o-mini powered fashion assistant
- **Product Search**: Google Custom Search API integration
- **Secure API Management**: All API keys managed server-side

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment Variables

The project uses a single centralized `.env` file located at the **project root** (not in backend/).

From the project root directory:

```bash
cp .env.example .env
```

Edit the root `.env` file and add your API keys:

```env
HF_TOKEN=your_huggingface_token
GOOGLE_API_KEY=your_google_api_key
CUSTOM_SEARCH_ENGINE_ID=your_search_engine_id
OPENAI_API_KEY=your_openai_api_key
VITE_BACKEND_API_URL=http://localhost:8000
```

**Note**: The backend automatically loads environment variables from the project root `.env` file.

### 3. Run the Server

```bash
# Development mode with auto-reload
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Production mode
python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

### 4. View API Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Project Structure

```
backend/
├── app/
│   ├── services/
│   │   ├── __init__.py
│   │   ├── idm_vton_service.py       # Virtual try-on service
│   │   ├── google_search_service.py  # Product search service
│   │   └── openai_service.py         # AI stylist service
│   ├── __init__.py
│   └── main.py                       # FastAPI application & routes
└── requirements.txt                  # Python dependencies

Note: Environment variables are stored in the project root .env file (../env)
```

## Services

### IDM-VTON Service

Located in `app/services/idm_vton_service.py`

- Connects to Hugging Face IDM-VTON Space
- Handles virtual try-on requests
- Manages image processing and conversions
- Returns generated try-on images

### Google Search Service

Located in `app/services/google_search_service.py`

- Integrates Google Custom Search API
- Searches for fashion products
- Extracts product information (name, price, brand, images)
- Provides fallback results when API is unavailable

### OpenAI Service

Located in `app/services/openai_service.py`

- Powers AI stylist chat functionality
- Analyzes fashion images
- Generates clothing recommendations
- Uses GPT-4o-mini model for cost-effectiveness

## API Endpoints

### Health Check

```http
GET /
GET /api/health
```

Returns server health status.

### Virtual Try-On

```http
POST /api/clothing/try-on
Content-Type: multipart/form-data

person_image: <file>
clothing_image: <file>
garment_description: "A blue shirt"
auto_mask: true
auto_crop: false
denoise_steps: 30
seed: 42
```

### Product Search

```http
GET /api/search?query=blue+dress&num_results=10
```

### AI Chat

```http
POST /api/ai/chat
Content-Type: application/json

{
  "messages": [{"type": "user", "text": "What should I wear?"}],
  "context": {"closetName": "Summer", "preferences": {}}
}
```

### Image Analysis

```http
POST /api/ai/analyze-image
Content-Type: application/json

{
  "image_url": "https://example.com/image.jpg",
  "prompt": "Analyze this outfit"
}
```

### Recommendations

```http
POST /api/ai/recommendations
Content-Type: application/json

{
  "purpose": "work",
  "brands": "Nike",
  "minPrice": "50",
  "maxPrice": "200",
  "size": "M"
}
```

## Dependencies

- **fastapi**: Modern web framework for building APIs
- **uvicorn**: ASGI server for FastAPI
- **python-multipart**: Form data parsing
- **Pillow**: Image processing
- **gradio_client**: Hugging Face Gradio API client
- **python-dotenv**: Environment variable management
- **google-api-python-client**: Google API integration
- **httpx**: Async HTTP client for API calls

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `HF_TOKEN` | Optional | Hugging Face API token for better rate limits |
| `GOOGLE_API_KEY` | Required | Google Cloud API key with Custom Search enabled |
| `CUSTOM_SEARCH_ENGINE_ID` | Required | Programmable Search Engine ID |
| `OPENAI_API_KEY` | Required | OpenAI API key for GPT models |

## Security Best Practices

1. **Never commit `.env` files** - They contain sensitive API keys
2. **Use environment variables** - All sensitive data should be in `.env`
3. **API keys in backend only** - Never expose keys to frontend
4. **Rate limiting** - Consider implementing rate limiting for production
5. **CORS configuration** - Update CORS settings for production deployment

## Development

### Running Tests

```bash
# TODO: Add tests
pytest
```

### Code Formatting

```bash
# Format code with black
black app/

# Lint with flake8
flake8 app/
```

### Adding New Services

1. Create a new file in `app/services/`
2. Implement service class with singleton pattern
3. Add service to `app/services/__init__.py`
4. Import and use in `app/main.py`

## Deployment

### Docker (Recommended)

```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Environment Variables in Production

Use secrets management:
- Docker secrets
- Kubernetes secrets
- Cloud provider secret managers (AWS Secrets Manager, Google Secret Manager, etc.)

## Troubleshooting

### Hugging Face API Errors

- Check if HF_TOKEN is valid
- Verify internet connection
- Check Hugging Face Space status

### Google Search Not Working

- Verify API key has Custom Search API enabled
- Check daily quota limits
- Ensure Search Engine ID is correct

### OpenAI API Errors

- Verify API key is valid
- Check billing and usage limits
- Ensure model access permissions

## License

Educational purposes only.
