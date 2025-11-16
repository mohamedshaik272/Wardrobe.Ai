# Wardrobe.AI Setup Guide

## Prerequisites

- Python 3.10+
- CUDA-capable GPU (recommended, minimum 8GB VRAM)
- Git

## Installation

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Note**: This will install PyTorch 2.0+ and all necessary dependencies including:
- diffusers (for IDM-VTON)
- transformers (for CLIP models)
- accelerate (for model optimization)
- And all other required packages

### 2. IDM-VTON Setup

The IDM-VTON model has been integrated as a local model. The repository has already been cloned to `models/idm-vton-official/`.

#### Model Weights

Model weights will be **automatically downloaded** from HuggingFace on first use. The models will be cached in your HuggingFace cache directory (usually `~/.cache/huggingface/`).

**Total download size**: Approximately 12-15 GB

The following components will be downloaded:
- UNet models
- Text encoders (CLIP)
- Image encoder
- VAE
- Tokenizers
- Preprocessing models (DensePose, Human Parsing, OpenPose)

### 3. HairFastGAN Setup

Make sure HairFastGAN pretrained models are in place:

```
models/HairFastGAN/pretrained_models/
├── StyleGAN/
│   └── ffhq.pt
├── Rotate/
│   └── rotate_best.pth
├── Blending/
│   └── checkpoint.pth
└── PostProcess/
    └── pp_model.pth
```

## Running the Backend

```bash
cd backend
python app/main.py
```

The server will start at `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /
```

### Hairstyle Try-On
```
POST /api/hairstyles/try-on
```
Parameters:
- `face_image`: Image file
- `shape_id`: Hairstyle shape ID
- `color_id`: Hair color ID
- `align`: Boolean (default: true)

### Clothing Try-On
```
POST /api/clothing/try-on
```
Parameters:
- `person_image`: Image file of the person
- `clothing_image`: Image file of the garment
- `num_inference_steps`: Number of denoising steps (default: 30)
- `guidance_scale`: Guidance scale (default: 2.0)
- `seed`: Random seed (default: 42)

## Testing the API

You can test the API using the provided test script:

```bash
cd backend
python test_api.py
```

Or use curl:

```bash
curl -X POST http://localhost:8000/api/clothing/try-on \
  -F "person_image=@/path/to/person.jpg" \
  -F "clothing_image=@/path/to/clothing.jpg" \
  -F "num_inference_steps=30" \
  -F "guidance_scale=2.0" \
  -F "seed=42"
```

## Model Weights Management

### gitignore Configuration

The following are automatically excluded from git commits:
- All `.pth`, `.pt`, `.ckpt`, `.safetensors` files in `models/`
- HuggingFace cache directories
- The entire `models/idm-vton-official/` directory

### Disk Space

Expected disk usage:
- HairFastGAN models: ~2-3 GB
- IDM-VTON models (HuggingFace cache): ~12-15 GB
- Total: ~15-18 GB

## Troubleshooting

### Out of Memory (CUDA)

If you encounter CUDA out of memory errors:

1. Reduce `num_inference_steps` (e.g., from 30 to 20)
2. Use CPU instead (slower but works): Set `device = "cpu"` in code
3. Close other GPU-intensive applications

### Model Download Issues

If model downloads fail:
- Check your internet connection
- Verify HuggingFace is accessible
- Clear HuggingFace cache: `rm -rf ~/.cache/huggingface/`

### Import Errors

If you get import errors:
- Ensure all dependencies are installed: `pip install -r requirements.txt`
- Check Python version: `python --version` (should be 3.10+)
- Verify CUDA is available: `python -c "import torch; print(torch.cuda.is_available())"`

## Performance

### First Run
The first time you use IDM-VTON, expect:
- Model download: 10-30 minutes (depending on internet speed)
- Model loading: 1-2 minutes
- First inference: 30-60 seconds

### Subsequent Runs
- Model loading: 1-2 minutes (models cached)
- Inference: 10-30 seconds per image (with 30 steps)

## Development

### Project Structure

```
Wardrobe.Ai/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   └── idm_vton_model.py   # IDM-VTON wrapper
│   ├── requirements.txt
│   └── test_api.py
├── models/
│   ├── HairFastGAN/            # Local hairstyle model
│   ├── idm-vton-official/      # Cloned IDM-VTON repo (gitignored)
│   └── clothes-virtual-try-on/ # Old model (deprecated)
├── datasets/
│   ├── uploads/                # User uploaded images
│   └── generated/              # Generated results
└── .gitignore
```

## License

- IDM-VTON: CC BY-NC-SA 4.0 (Non-commercial use only)
- HairFastGAN: Check their repository for license details
