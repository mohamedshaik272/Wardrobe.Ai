"""IDM-VTON service using Hugging Face Gradio Client API"""
import logging
import os
from pathlib import Path
from typing import Union, Optional
from gradio_client import Client, handle_file

logger = logging.getLogger(__name__)


class IDMVTONService:
    """IDM-VTON virtual try-on using Hugging Face Spaces"""

    def __init__(self, space_name: str = "yisol/IDM-VTON", hf_token: Optional[str] = None):
        """
        Initialize IDM-VTON service

        Args:
            space_name: Hugging Face Space name (default: yisol/IDM-VTON)
            hf_token: Hugging Face API token (optional, reads from HF_TOKEN env var if not provided)
        """
        self.space_name = space_name
        # Handle empty string tokens (from .env files with HF_TOKEN=)
        token = hf_token or os.getenv("HF_TOKEN")
        self.hf_token = token if token else None
        self.client = None
        logger.info(f"IDM-VTON service initialized with space: {space_name}")
        if self.hf_token:
            logger.info("Using authenticated Hugging Face token. ✅")
        else:
            logger.warning("No Hugging Face token provided. Using anonymous access (limited quota). ⚠️")

    def _get_client(self) -> Client:
        """Get or create Gradio client"""
        if self.client is None:
            logger.info(f"Connecting to Hugging Face Space: {self.space_name}")
            # Only pass hf_token if it's not None to avoid "Illegal header value" error
            if self.hf_token:
                self.client = Client(self.space_name, hf_token=self.hf_token)
            else:
                self.client = Client(self.space_name)
        return self.client

    def try_on(
        self,
        person_image: Union[str, Path],
        garment_image: Union[str, Path],
        garment_description: str = "A clothing item",
        is_checked: bool = True,
        is_checked_crop: bool = False,
        denoise_steps: int = 30,
        seed: int = 42,
    ) -> str:
        """
        Perform virtual try-on

        Args:
            person_image: Path to person image
            garment_image: Path to garment/clothing image
            garment_description: Description of the garment
            is_checked: Whether to use auto-masking (default: True)
            is_checked_crop: Whether to auto-crop (default: False)
            denoise_steps: Number of denoising steps (default: 30)
            seed: Random seed (default: 42)

        Returns:
            Path to the generated try-on image
        """
        try:
            client = self._get_client()

            logger.info(f"Running virtual try-on with person: {person_image}, garment: {garment_image}")

            # Call the Gradio API
            # The API endpoint expects: dict(human_img, garm_img, garment_des, is_checked, is_checked_crop, denoise_steps, seed)
            result = client.predict(
                dict={"background": handle_file(str(person_image)), "layers": [], "composite": None},
                garm_img=handle_file(str(garment_image)),
                garment_des=garment_description,
                is_checked=is_checked,
                is_checked_crop=is_checked_crop,
                denoise_steps=denoise_steps,
                seed=seed,
                api_name="/tryon"
            )

            logger.info(f"Virtual try-on completed. Result: {result}")

            # Result is typically a tuple with (image_path, mask_path) or just image_path
            if isinstance(result, tuple):
                return result[0]
            return result

        except Exception as e:
            logger.error(f"Error during virtual try-on: {e}")
            raise


# Singleton instance
_idm_vton_service = None


def initialize_idm_vton_service(hf_token: Optional[str] = None):
    """Initialize the singleton service instance."""
    global _idm_vton_service
    if _idm_vton_service is None:
        _idm_vton_service = IDMVTONService(hf_token=hf_token)


def get_idm_vton_service() -> IDMVTONService:
    """Get singleton IDM-VTON service instance"""
    global _idm_vton_service
    if _idm_vton_service is None:
        logger.warning("IDM-VTON service was not initialized at startup. Initializing now.")
        initialize_idm_vton_service()
    return _idm_vton_service
