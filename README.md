# Wardrobe.AI

Virtual try-on for hairstyles and clothing using AI models.

## Quick Start

```bash
# Install dependencies
cd backend
pip install -r requirements.txt

# Run the server
python app/main.py
```

Server runs at `http://localhost:8000`

## API Endpoints

**Hairstyle Try-On**
```bash
POST /api/hairstyles/try-on
```

**Clothing Try-On**
```bash
POST /api/clothing/try-on
```

## Requirements

- Python 3.10+
- CUDA GPU (8GB+ VRAM recommended)
- ~15GB disk space for models (auto-downloaded on first use)
