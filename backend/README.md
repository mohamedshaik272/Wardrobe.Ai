# Wardrobe.AI Backend

FastAPI backend for hairstyle try-on.

## Setup

```bash
cd backend
pip install -r requirements.txt
```

Add hair color images to `../datasets/colors/` (blonde.png, brunette.png, etc.)

## Run

```bash
python app/main.py
```

API docs: http://localhost:8000/docs

## Endpoints

```
GET  /api/hairstyles/shapes
GET  /api/hairstyles/colors
POST /api/hairstyles/try-on
POST /api/clothing/try-on
```

## Files

- Uploads: `../datasets/uploads/`
- Generated: `../datasets/generated/`
- Models: `../models/HairFastGAN/`
