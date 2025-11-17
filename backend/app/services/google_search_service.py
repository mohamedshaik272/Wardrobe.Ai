"""Google Custom Search service for product search"""
import logging
import os
from typing import List, Dict, Any, Optional
from pathlib import Path
from googleapiclient.discovery import build
from dotenv import load_dotenv

# Load .env file from project root directory
project_root = Path(__file__).resolve().parent.parent.parent.parent
env_path = project_root / '.env'
load_dotenv(dotenv_path=env_path, override=True)

logger = logging.getLogger(__name__)


class GoogleSearchService:
    """Google Custom Search API service for finding clothing/products"""

    def __init__(
        self,
        api_key: Optional[str] = None,
        search_engine_id: Optional[str] = None
    ):
        """
        Initialize Google Search service

        Args:
            api_key: Google API key (reads from GOOGLE_API_KEY env var if not provided)
            search_engine_id: Custom Search Engine ID (reads from CUSTOM_SEARCH_ENGINE_ID env var if not provided)
        """
        self.api_key = api_key or os.getenv("GOOGLE_API_KEY")
        self.search_engine_id = search_engine_id or os.getenv("CUSTOM_SEARCH_ENGINE_ID")

        if not self.api_key:
            logger.warning("Google API key not found. Search functionality will be limited.")
        if not self.search_engine_id:
            logger.warning("Custom Search Engine ID not found. Search functionality will be limited.")

        self.service = None
        if self.api_key:
            try:
                self.service = build("customsearch", "v1", developerKey=self.api_key)
                logger.info("Google Custom Search service initialized successfully")
            except Exception as e:
                logger.error(f"Failed to initialize Google Custom Search service: {e}")

    def search_products(
        self,
        query: str,
        num_results: int = 10,
        search_type: str = "shopping"
    ) -> List[Dict[str, Any]]:
        """
        Search for products using Google Custom Search

        Args:
            query: Search query string
            num_results: Number of results to return (max 10 per request)
            search_type: Type of search (shopping, image, etc.)

        Returns:
            List of search results with product information
        """
        if not self.service or not self.search_engine_id:
            logger.warning("Google Search not properly configured. Returning fallback results.")
            return self._get_fallback_results(query)

        try:
            # Add keywords to find specific product pages (not category pages)
            # Using site-specific patterns to target individual product pages
            enhanced_query = f"{query} site:amazon.com OR site:nike.com/t OR site:dickssportinggoods.com/p OR site:footlocker.com/product"

            logger.info(f"Searching Google Custom Search for: {enhanced_query}")

            # Build search parameters with USA location
            search_params = {
                "q": enhanced_query,
                "cx": self.search_engine_id,
                "num": min(num_results, 10),  # Google API max is 10 per request
                "gl": "us",  # Geolocation: United States
                "cr": "countryUS",  # Country restrict: USA
                "lr": "lang_en"  # Language: English
            }

            # Add searchType if specified
            if search_type == "image":
                search_params["searchType"] = "image"

            # Execute the search
            result = self.service.cse().list(**search_params).execute()

            # Process and format results
            items = result.get("items", [])
            formatted_results = []

            for item in items:
                image_url = self._extract_image(item)

                # If we got a Google thumbnail, try to get the original image from metatags
                if 'gstatic.com' in image_url or 'placeholder' in image_url:
                    # Try harder to find a real product image
                    if "pagemap" in item and "metatags" in item["pagemap"]:
                        metatags = item["pagemap"]["metatags"][0] if item["pagemap"]["metatags"] else {}
                        # Try all possible image fields
                        for field in ["og:image:secure_url", "og:image", "twitter:image:src", "twitter:image"]:
                            alt_img = metatags.get(field, "")
                            if alt_img and 'gstatic' not in alt_img and len(alt_img) > 30:
                                image_url = alt_img
                                break

                formatted_item = {
                    "id": item.get("link", ""),
                    "name": item.get("title", ""),
                    "description": item.get("snippet", ""),
                    "link": item.get("link", ""),
                    "image": image_url,
                    "price": self._extract_price(item),
                    "brand": self._extract_brand(item)
                }
                formatted_results.append(formatted_item)

            logger.info(f"Found {len(formatted_results)} results for query: {query}")
            return formatted_results

        except Exception as e:
            logger.error(f"Error during Google search: {e}", exc_info=True)
            return self._get_fallback_results(query)

    def _extract_image(self, item: Dict[str, Any]) -> str:
        """Extract product image URL from search result"""
        # Priority 1: Product images from pagemap
        if "pagemap" in item:
            # Try product images
            if "product" in item["pagemap"]:
                products = item["pagemap"]["product"]
                if products and len(products) > 0:
                    img = products[0].get("image", "")
                    if img and not img.endswith(('.png', '.jpg', '.jpeg')) and 'android-icon' not in img:
                        # If it doesn't look like a product image, skip
                        pass
                    elif img and 'placeholder' not in img.lower():
                        return img

            # Try cse_thumbnail (higher quality than cse_image)
            if "cse_thumbnail" in item["pagemap"]:
                thumbnails = item["pagemap"]["cse_thumbnail"]
                if thumbnails and len(thumbnails) > 0:
                    img = thumbnails[0].get("src", "")
                    if img and 'android-icon' not in img and 'logo' not in img.lower():
                        return img

            # Try cse_image
            if "cse_image" in item["pagemap"]:
                images = item["pagemap"]["cse_image"]
                if images and len(images) > 0:
                    img = images[0].get("src", "")
                    if img and 'android-icon' not in img and 'logo' not in img.lower():
                        return img

            # Try metatags og:image (product pages usually have good og:image)
            if "metatags" in item["pagemap"]:
                metatags = item["pagemap"]["metatags"]
                if metatags and len(metatags) > 0:
                    # Try various meta tag image fields
                    for field in ["og:image", "twitter:image", "image"]:
                        img = metatags[0].get(field, "")
                        if img and 'android-icon' not in img and 'logo' not in img.lower() and len(img) > 20:
                            return img

        # Default placeholder
        return "https://via.placeholder.com/300x400?text=No+Image"

    def _extract_price(self, item: Dict[str, Any]) -> str:
        """Extract price from search result"""
        # Try to find price in pagemap offer
        if "pagemap" in item and "offer" in item["pagemap"]:
            offers = item["pagemap"]["offer"]
            if offers and len(offers) > 0:
                price = offers[0].get("price", "")
                currency = offers[0].get("pricecurrency", "USD")
                if price:
                    return f"{currency} {price}"

        # Try snippet
        snippet = item.get("snippet", "")
        if "$" in snippet:
            # Simple price extraction (can be improved with regex)
            words = snippet.split()
            for word in words:
                if "$" in word:
                    return word

        return "N/A"

    def _extract_brand(self, item: Dict[str, Any]) -> str:
        """Extract brand from search result"""
        # Try to find brand in pagemap
        if "pagemap" in item and "product" in item["pagemap"]:
            products = item["pagemap"]["product"]
            if products and len(products) > 0:
                brand = products[0].get("brand", "")
                if brand:
                    return brand

        # Try metatags
        if "pagemap" in item and "metatags" in item["pagemap"]:
            metatags = item["pagemap"]["metatags"]
            if metatags and len(metatags) > 0:
                brand = metatags[0].get("og:site_name", "")
                if brand:
                    return brand

        # Extract from URL
        link = item.get("link", "")
        if link:
            # Extract domain name as brand
            from urllib.parse import urlparse
            parsed = urlparse(link)
            domain = parsed.netloc.replace("www.", "").split(".")[0]
            return domain.title()

        return "Unknown"

    def _get_fallback_results(self, query: str) -> List[Dict[str, Any]]:
        """Return fallback results when API is not available"""
        logger.info(f"Returning fallback results for query: {query}")

        return [
            {
                "id": "https://www.nike.com/",
                "name": f"Nike {query}",
                "image": "https://via.placeholder.com/300x400?text=Nike",
                "price": "N/A",
                "brand": "Nike",
                "description": f"Find {query} at Nike.com. Free delivery and returns.",
                "link": "https://www.nike.com/"
            },
            {
                "id": "https://www.adidas.com/",
                "name": f"Adidas {query}",
                "image": "https://via.placeholder.com/300x400?text=Adidas",
                "price": "N/A",
                "brand": "Adidas",
                "description": f"Shop {query} at Adidas. Premium quality sportswear.",
                "link": "https://www.adidas.com/"
            },
            {
                "id": "https://www.zara.com/",
                "name": f"Zara {query}",
                "image": "https://via.placeholder.com/300x400?text=Zara",
                "price": "N/A",
                "brand": "Zara",
                "description": f"Discover {query} at Zara. Latest fashion trends.",
                "link": "https://www.zara.com/"
            }
        ]


# Singleton instance
_google_search_service = None


def get_google_search_service() -> GoogleSearchService:
    """Get singleton Google Search service instance"""
    global _google_search_service
    if _google_search_service is None:
        _google_search_service = GoogleSearchService()
    return _google_search_service
