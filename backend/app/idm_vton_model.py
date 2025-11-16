"""
IDM-VTON Local Model Wrapper
Provides inference for virtual clothing try-on using IDM-VTON model
"""

import sys
import torch
from pathlib import Path
from PIL import Image
import numpy as np
from typing import Union
import logging

# Add IDM-VTON official repo to path
IDM_VTON_PATH = Path(__file__).parent.parent.parent / "models" / "idm-vton-official"
sys.path.insert(0, str(IDM_VTON_PATH))
sys.path.insert(0, str(IDM_VTON_PATH / "gradio_demo"))

logger = logging.getLogger(__name__)


class IDMVTONModel:
    """Wrapper for IDM-VTON virtual try-on model"""

    def __init__(self, device: str = "cuda"):
        """
        Initialize IDM-VTON model

        Args:
            device: Device to run model on ("cuda" or "cpu")
        """
        self.device = device
        self.pipe = None
        self.parsing_model = None
        self.openpose_model = None
        self._load_model()

    def _load_model(self):
        """Load the IDM-VTON pipeline from HuggingFace"""
        try:
            logger.info("Loading IDM-VTON model from HuggingFace...")

            # Import custom modules from official repo
            from src.tryon_pipeline import StableDiffusionXLInpaintPipeline as TryonPipeline
            from src.unet_hacked_garmnet import UNet2DConditionModel as UNet2DConditionModel_ref
            from src.unet_hacked_tryon import UNet2DConditionModel
            from transformers import (
                CLIPImageProcessor,
                CLIPVisionModelWithProjection,
                CLIPTextModel,
                CLIPTextModelWithProjection,
                AutoTokenizer,
            )
            from diffusers import DDPMScheduler, AutoencoderKL
            from preprocess.humanparsing.run_parsing import Parsing
            from preprocess.openpose.run_openpose import OpenPose

            base_path = "yisol/IDM-VTON"
            dtype = torch.float16 if self.device == "cuda" else torch.float32

            # Load all model components
            unet = UNet2DConditionModel.from_pretrained(
                base_path, subfolder="unet", torch_dtype=dtype
            )
            unet.requires_grad_(False)

            UNet_Encoder = UNet2DConditionModel_ref.from_pretrained(
                base_path, subfolder="unet_encoder", torch_dtype=dtype
            )
            UNet_Encoder.requires_grad_(False)

            tokenizer_one = AutoTokenizer.from_pretrained(
                base_path, subfolder="tokenizer", use_fast=False
            )
            tokenizer_two = AutoTokenizer.from_pretrained(
                base_path, subfolder="tokenizer_2", use_fast=False
            )

            noise_scheduler = DDPMScheduler.from_pretrained(base_path, subfolder="scheduler")

            text_encoder_one = CLIPTextModel.from_pretrained(
                base_path, subfolder="text_encoder", torch_dtype=dtype
            )
            text_encoder_one.requires_grad_(False)

            text_encoder_two = CLIPTextModelWithProjection.from_pretrained(
                base_path, subfolder="text_encoder_2", torch_dtype=dtype
            )
            text_encoder_two.requires_grad_(False)

            image_encoder = CLIPVisionModelWithProjection.from_pretrained(
                base_path, subfolder="image_encoder", torch_dtype=dtype
            )
            image_encoder.requires_grad_(False)

            vae = AutoencoderKL.from_pretrained(
                base_path, subfolder="vae", torch_dtype=dtype
            )
            vae.requires_grad_(False)

            # Initialize preprocessing models
            gpu_id = 0 if self.device == "cuda" else -1
            self.parsing_model = Parsing(gpu_id)
            self.openpose_model = OpenPose(gpu_id)

            # Create the pipeline
            self.pipe = TryonPipeline.from_pretrained(
                base_path,
                unet=unet,
                vae=vae,
                feature_extractor=CLIPImageProcessor(),
                text_encoder=text_encoder_one,
                text_encoder_2=text_encoder_two,
                tokenizer=tokenizer_one,
                tokenizer_2=tokenizer_two,
                scheduler=noise_scheduler,
                image_encoder=image_encoder,
                torch_dtype=dtype,
            )
            self.pipe.unet_encoder = UNet_Encoder

            logger.info("IDM-VTON model loaded successfully")

        except Exception as e:
            logger.error(f"Error loading IDM-VTON model: {e}")
            raise

    def try_on(
        self,
        person_image: Union[str, Path, Image.Image],
        garment_image: Union[str, Path, Image.Image],
        num_inference_steps: int = 30,
        guidance_scale: float = 2.0,
        seed: int = 42,
        auto_mask: bool = True,
        auto_crop: bool = False,
    ) -> Image.Image:
        """
        Perform virtual try-on

        Args:
            person_image: Path to person image or PIL Image
            garment_image: Path to garment image or PIL Image
            num_inference_steps: Number of denoising steps
            guidance_scale: Guidance scale for generation
            seed: Random seed for reproducibility
            auto_mask: Whether to auto-generate mask using human parsing
            auto_crop: Whether to auto-crop the image

        Returns:
            PIL Image with try-on result
        """
        if self.pipe is None:
            raise RuntimeError("Model not loaded. Call _load_model() first.")

        try:
            from torchvision import transforms
            from utils_mask import get_mask_location
            import apply_net

            # Load images
            if isinstance(person_image, (str, Path)):
                person_img = Image.open(person_image).convert("RGB")
            else:
                person_img = person_image.convert("RGB")

            if isinstance(garment_image, (str, Path)):
                garm_img = Image.open(garment_image).convert("RGB")
            else:
                garm_img = garment_image.convert("RGB")

            # Resize garment image
            garm_img = garm_img.resize((768, 1024))

            # Handle cropping if requested
            if auto_crop:
                width, height = person_img.size
                target_width = int(min(width, height * (3 / 4)))
                target_height = int(min(height, width * (4 / 3)))
                left = (width - target_width) / 2
                top = (height - target_height) / 2
                right = (width + target_width) / 2
                bottom = (height + target_height) / 2
                person_img = person_img.crop((left, top, right, bottom))

            person_img = person_img.resize((768, 1024))

            # Move models to device
            if self.device == "cuda":
                self.openpose_model.preprocessor.body_estimation.model.to(self.device)
                self.pipe.to(self.device)
                self.pipe.unet_encoder.to(self.device)

            # Generate mask and pose if auto_mask is enabled
            if auto_mask:
                keypoints = self.openpose_model(person_img.resize((384, 512)))
                model_parse, _ = self.parsing_model(person_img.resize((384, 512)))
                mask, mask_gray = get_mask_location('hd', "upper_body", model_parse, keypoints)
                mask = mask.resize((768, 1024))
            else:
                # Use a simple mask
                mask = Image.new("L", (768, 1024), 255)

            # Prepare for inference
            from detectron2.data.detection_utils import convert_PIL_to_numpy

            keypoints = self.openpose_model(person_img.resize((384, 512)))
            model_parse, _ = self.parsing_model(person_img.resize((384, 512)))
            mask, mask_gray = get_mask_location('hd', "upper_body", model_parse, keypoints)
            mask = mask.resize((768, 1024))

            # Apply DensePose
            densepose = apply_net.apply_net_image(person_img, IDM_VTON_PATH / "gradio_demo")

            # Set seed
            generator = torch.Generator(self.device).manual_seed(seed)

            # Run inference
            logger.info("Running IDM-VTON inference...")
            images = self.pipe(
                prompt="model is wearing",
                image=person_img,
                mask_image=mask,
                pose_image=densepose,
                garment_image=garm_img,
                num_inference_steps=num_inference_steps,
                guidance_scale=guidance_scale,
                generator=generator,
            )[0]

            logger.info("IDM-VTON inference completed")
            return images[0]

        except Exception as e:
            logger.error(f"Error during try-on generation: {e}")
            raise


# Singleton instance
_idm_vton_instance = None


def get_idm_vton_model(device: str = "cuda") -> IDMVTONModel:
    """
    Get singleton instance of IDM-VTON model

    Args:
        device: Device to run model on

    Returns:
        IDMVTONModel instance
    """
    global _idm_vton_instance
    if _idm_vton_instance is None:
        _idm_vton_instance = IDMVTONModel(device=device)
    return _idm_vton_instance
