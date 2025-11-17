"""OpenAI service for AI stylist chat and recommendations"""
import logging
import os
import json
from typing import List, Dict, Any, Optional
from pathlib import Path
from dotenv import load_dotenv
import httpx

# Load .env file from project root directory
project_root = Path(__file__).resolve().parent.parent.parent.parent
env_path = project_root / '.env'
load_dotenv(dotenv_path=env_path, override=True)

logger = logging.getLogger(__name__)


class OpenAIService:
    """OpenAI API service for AI stylist functionality"""

    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize OpenAI service

        Args:
            api_key: OpenAI API key (reads from OPENAI_API_KEY env var if not provided)
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.base_url = "https://api.openai.com/v1"
        self.model = "gpt-4o-mini"

        if not self.api_key:
            logger.warning("OpenAI API key not found. AI features will be unavailable.")
        else:
            logger.info("OpenAI service initialized successfully")

    async def get_chat_response(
        self,
        messages: List[Dict[str, str]],
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Get AI chat response

        Args:
            messages: List of message objects with 'type' and 'text' keys
            context: Optional context including closet info and preferences

        Returns:
            AI response text
        """
        if not self.api_key:
            logger.error("OpenAI API key not configured. Please set OPENAI_API_KEY in backend/.env")
            raise ValueError("OpenAI API key not configured. Please add OPENAI_API_KEY to backend/.env")

        context = context or {}

        # Build system message
        system_message = {
            "role": "system",
            "content": f"""You are a professional AI fashion stylist. You help users find clothing that matches their style, preferences, and needs.

Current context:
- Closet: {context.get('closetName', 'General Wardrobe')}
- Type: {context.get('closetType', 'Mixed')}
- User preferences: {json.dumps(context.get('preferences', {}))}

Be helpful, friendly, and provide specific fashion advice. When users describe what they're looking for, suggest specific styles, brands, colors, and combinations."""
        }

        # Format messages for OpenAI API
        formatted_messages = [system_message]
        for msg in messages:
            formatted_messages.append({
                "role": "user" if msg.get("type") == "user" else "assistant",
                "content": msg.get("text", "")
            })

        try:
            # Ensure API key is not empty
            if not self.api_key or not self.api_key.strip():
                raise ValueError("OpenAI API key is empty or invalid")

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.api_key}"
                    },
                    json={
                        "model": self.model,
                        "messages": formatted_messages,
                        "temperature": 0.7,
                        "max_tokens": 500
                    }
                )

                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]

        except httpx.HTTPStatusError as e:
            logger.error(f"OpenAI API HTTP error: {e.response.status_code} - {e.response.text}")
            raise ValueError(f"OpenAI API error: {e.response.status_code}")
        except Exception as e:
            logger.error(f"Error calling OpenAI API: {e}", exc_info=True)
            raise

    async def analyze_image(
        self,
        image_url: str,
        prompt: Optional[str] = None
    ) -> str:
        """
        Analyze fashion image using GPT-4 Vision

        Args:
            image_url: URL of the image to analyze
            prompt: Optional custom prompt (uses default fashion analysis if not provided)

        Returns:
            AI analysis text
        """
        if not self.api_key or not self.api_key.strip():
            logger.error("OpenAI API key not configured. Please set OPENAI_API_KEY in backend/.env")
            raise ValueError("OpenAI API key not configured. Please add OPENAI_API_KEY to backend/.env")

        default_prompt = "Analyze this fashion image and describe the style, colors, patterns, and suggest similar items."

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.api_key}"
                    },
                    json={
                        "model": self.model,
                        "messages": [
                            {
                                "role": "user",
                                "content": [
                                    {
                                        "type": "text",
                                        "text": prompt or default_prompt
                                    },
                                    {
                                        "type": "image_url",
                                        "image_url": {
                                            "url": image_url
                                        }
                                    }
                                ]
                            }
                        ],
                        "max_tokens": 500
                    }
                )

                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]

        except Exception as e:
            logger.error(f"Error analyzing image: {e}", exc_info=True)
            raise

    async def generate_clothing_recommendations(
        self,
        preferences: Dict[str, Any],
        google_search_service = None
    ) -> List[Dict[str, Any]]:
        """
        Generate clothing recommendations based on preferences using Google Shopping

        Args:
            preferences: Dictionary with user preferences (purpose, brands, price, size, etc.)
            google_search_service: Google search service to fetch real products

        Returns:
            List of recommended clothing items from real stores
        """
        if not self.api_key or not self.api_key.strip():
            logger.error("OpenAI API key not configured. Please set OPENAI_API_KEY in backend/.env")
            raise ValueError("OpenAI API key not configured. Please add OPENAI_API_KEY to backend/.env")

        # Use AI to generate 5 different clothing item types
        purpose = preferences.get('purpose', 'casual')
        brand_pref = preferences.get('brands', 'any')

        prompt = f"""Based on these preferences, suggest 5 DIFFERENT men's clothing item types suitable for {purpose}.
- Brands: {brand_pref}
- Price Range: ${preferences.get('minPrice', '0')}-${preferences.get('maxPrice', '200')}

Return ONLY 5 specific item types, one per line, 2-4 words each. Make them diverse (e.g., one top, one bottom, one shoes, etc.).
Examples: "performance running shorts", "crew neck t-shirt", "training joggers", "athletic sneakers", "zip-up hoodie"

Item 1:
Item 2:
Item 3:
Item 4:
Item 5:"""

        try:
            # Get AI-generated clothing item types
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {self.api_key}"
                    },
                    json={
                        "model": self.model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.8,
                        "max_tokens": 100
                    }
                )
                response.raise_for_status()
                data = response.json()
                items_text = data["choices"][0]["message"]["content"].strip()

                # Parse the item types
                item_types = []
                for line in items_text.split('\n'):
                    line = line.strip()
                    # Remove "Item 1:", "1.", etc. prefixes
                    if ':' in line:
                        line = line.split(':', 1)[1].strip()
                    elif line and line[0].isdigit():
                        line = line.lstrip('0123456789.)-').strip()

                    if line and len(line) > 3:
                        item_types.append(line)

                logger.info(f"AI-generated item types: {item_types}")

            # Use Google Search to find real products for each item type
            all_results = []
            if google_search_service:
                brand_filter = preferences.get('brands', '')

                for item_type in item_types[:5]:  # Take top 5 item types
                    # Build search query with brand and "men's"
                    if brand_filter and brand_filter.lower() != 'any':
                        search_query = f"{brand_filter} men's {item_type}"
                    else:
                        search_query = f"men's {item_type}"

                    logger.info(f"Searching Google Shopping for: {search_query}")
                    results = google_search_service.search_products(search_query, num_results=2)

                    # Take the first result for this item type
                    if results:
                        all_results.append(results[0])

                # Add unique IDs
                for i, item in enumerate(all_results):
                    if 'id' not in item or not item['id']:
                        item['id'] = f"prod_{i}_{hash(item.get('name', ''))}"

                logger.info(f"Found {len(all_results)} different product types")
                return all_results[:5]
            else:
                logger.warning("Google Search service not available, cannot fetch real products")
                return []

        except Exception as e:
            logger.error(f"Error generating recommendations: {e}", exc_info=True)
            raise


# Singleton instance
_openai_service = None


def get_openai_service() -> OpenAIService:
    """Get singleton OpenAI service instance"""
    global _openai_service
    if _openai_service is None:
        _openai_service = OpenAIService()
    return _openai_service
