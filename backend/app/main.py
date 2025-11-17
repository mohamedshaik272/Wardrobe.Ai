"""Wardrobe.AI Backend - Virtual try-on for hairstyles and clothing using Hugging Face APIs"""
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from pathlib import Path
import uuid
import shutil
import logging
import os
from typing import Optional, List, Dict, Any
from PIL import Image
from dotenv import load_dotenv

# Load environment variables from root .env file
project_root = Path(__file__).resolve().parent.parent.parent
env_path = project_root / '.env'
load_dotenv(dotenv_path=env_path, override=True)

from app.services.idm_vton_service import get_idm_vton_service, initialize_idm_vton_service
from app.services.google_search_service import get_google_search_service
from app.services.openai_service import get_openai_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def save_and_convert_to_png(upload_file: UploadFile, save_dir: Path) -> Path:
    """Saves an uploaded file and converts it to PNG, returning the new path."""
    # Create a unique filename to avoid conflicts
    temp_path = save_dir / f"{uuid.uuid4()}{Path(upload_file.filename).suffix}"
    with open(temp_path, "wb") as f:
        shutil.copyfileobj(upload_file.file, f)

    # If it's already a PNG, just return the path
    if temp_path.suffix.lower() == ".png":
        return temp_path

    # Convert to PNG
    png_path = temp_path.with_suffix(".png")
    try:
        with Image.open(temp_path) as img:
            # Using .convert("RGB") to handle formats like WEBP that might have an alpha channel
            # and to ensure compatibility with models that expect 3-channel images.
            rgb_img = img.convert("RGB")
            rgb_img.save(png_path, "PNG")
        
        temp_path.unlink()  # Remove the original non-PNG file
        logger.info(f"Successfully converted {temp_path.name} to {png_path.name}")
        return png_path
    except Exception:
        logger.error(f"Failed to convert {temp_path.name} to PNG.", exc_info=True)
        # If conversion fails, re-raise as an HTTPException
        raise HTTPException(status_code=400, detail=f"Invalid or unsupported image file: {upload_file.filename}")


app = FastAPI(
    title="Wardrobe.AI API",
    description="Virtual try-on for clothing",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup directories
UPLOADS = Path("../datasets/uploads")
GENERATED = Path("../datasets/generated")

UPLOADS.mkdir(parents=True, exist_ok=True)
GENERATED.mkdir(parents=True, exist_ok=True)

# Mount static files
app.mount("/files", StaticFiles(directory="../datasets"), name="files")


@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "Wardrobe.AI API is running",
        "version": "2.0.0"
    }


@app.get("/api/health")
def health():
    """Detailed health check"""
    import os

    services_status = {
        "idm_vton": "ready",
        "google_search": "ready" if os.getenv("GOOGLE_API_KEY") else "not configured",
        "openai": "ready" if os.getenv("OPENAI_API_KEY") else "not configured"
    }

    return {
        "status": "healthy",
        "services": services_status
    }


@app.post("/api/clothing/try-on")
async def clothing_tryon(
    person_image: UploadFile = File(..., description="Image of the person"),
    clothing_image: UploadFile = File(..., description="Image of the clothing item"),
    garment_description: str = Form(default="A clothing item", description="Description of the garment"),
    auto_mask: bool = Form(default=True, description="Use automatic masking"),
    auto_crop: bool = Form(default=False, description="Automatically crop the image"),
    denoise_steps: int = Form(default=30, description="Number of denoising steps"),
    seed: int = Form(default=42, description="Random seed for reproducibility")
):
    """
    Virtual try-on for clothing using IDM-VTON

    Upload a person image and a clothing image to see how the clothing looks on the person.
    """
    try:
        # Save and convert uploaded files to PNG
        person_path = save_and_convert_to_png(person_image, UPLOADS)
        clothing_path = save_and_convert_to_png(clothing_image, UPLOADS)

        logger.info(f"Processing clothing try-on request")

        # Call IDM-VTON service
        service = get_idm_vton_service()
        result_path = service.try_on(
            person_image=person_path,
            garment_image=clothing_path,
            garment_description=garment_description,
            is_checked=auto_mask,
            is_checked_crop=auto_crop,
            denoise_steps=denoise_steps,
            seed=seed
        )

        # Copy result to generated folder with a unique name
        output_filename = f"{uuid.uuid4()}.png"
        output_path = GENERATED / output_filename
        shutil.copy(result_path, output_path)

        logger.info(f"Clothing try-on completed: {output_path}")

        return {
            "success": True,
            "result": f"/files/generated/{output_filename}",
            "message": "Virtual try-on completed successfully"
        }

    except Exception as e:
        logger.error(f"Error in clothing try-on: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/search")
async def search_products(query: str, num_results: int = 10):
    """
    Search for clothing/products using Google Custom Search API

    Args:
        query: Search query string
        num_results: Number of results to return (default: 10)

    Returns:
        JSON with search results
    """
    try:
        service = get_google_search_service()
        results = service.search_products(query, num_results=num_results)

        logger.info(f"Search completed for query: '{query}' - Found {len(results)} results")

        return {"results": results}

    except Exception as e:
        logger.error(f"Error in product search: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/chat")
async def ai_chat(
    messages: List[Dict[str, str]] = Body(...),
    context: Optional[Dict[str, Any]] = Body(default=None)
):
    """
    Get AI stylist chat response

    Args:
        messages: List of chat messages with 'type' and 'text' fields
        context: Optional context with closet info and preferences

    Returns:
        JSON with AI response
    """
    try:
        service = get_openai_service()
        response = await service.get_chat_response(messages, context)

        return {"response": response}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in AI chat: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/analyze-image")
async def analyze_image(
    image_url: str = Body(...),
    prompt: Optional[str] = Body(default=None)
):
    """
    Analyze fashion image using AI

    Args:
        image_url: URL of the image to analyze
        prompt: Optional custom analysis prompt

    Returns:
        JSON with AI analysis
    """
    try:
        service = get_openai_service()
        analysis = await service.analyze_image(image_url, prompt)

        return {"analysis": analysis}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in image analysis: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/recommendations")
async def generate_recommendations(preferences: Dict[str, Any] = Body(...)):
    """
    Generate clothing recommendations based on preferences using real Google Shopping results

    Args:
        preferences: User preferences (purpose, brands, price, size, etc.)

    Returns:
        JSON with recommended items from real stores
    """
    try:
        openai_service = get_openai_service()
        google_service = get_google_search_service()

        # Pass Google Search service to get real products
        recommendations = await openai_service.generate_clothing_recommendations(
            preferences,
            google_search_service=google_service
        )

        logger.info(f"Generated {len(recommendations)} real product recommendations")
        return {"recommendations": recommendations}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating recommendations: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)