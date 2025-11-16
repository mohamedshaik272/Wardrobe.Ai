"""Wardrobe.AI Backend - Virtual try-on for hairstyles and clothing"""
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import sys
import uuid
import shutil
import torch
import torchvision.transforms.functional as F
from PIL import Image
import numpy as np
from typing import Union
import logging

sys.path.insert(0, str(Path("../models/HairFastGAN").resolve()))
IDM_VTON_PATH = Path("../models/idm-vton-official").resolve()
sys.path.insert(0, str(IDM_VTON_PATH))
sys.path.insert(0, str(IDM_VTON_PATH / "gradio_demo"))

from hair_swap import HairFast, get_parser

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class IDMVTONModel:
    """IDM-VTON virtual try-on model wrapper"""

    def __init__(self, device: str = "cuda"):
        self.device = device
        self.pipe = None
        self.parsing_model = None
        self.openpose_model = None
        self._load_model()

    def _load_model(self):
        try:
            logger.info("Loading IDM-VTON model from HuggingFace...")

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

            gpu_id = 0 if self.device == "cuda" else -1
            self.parsing_model = Parsing(gpu_id)
            self.openpose_model = OpenPose(gpu_id)

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
        if self.pipe is None:
            raise RuntimeError("Model not loaded")

        try:
            from torchvision import transforms
            from utils_mask import get_mask_location
            import apply_net

            if isinstance(person_image, (str, Path)):
                person_img = Image.open(person_image).convert("RGB")
            else:
                person_img = person_image.convert("RGB")

            if isinstance(garment_image, (str, Path)):
                garm_img = Image.open(garment_image).convert("RGB")
            else:
                garm_img = garment_image.convert("RGB")

            garm_img = garm_img.resize((768, 1024))

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

            if self.device == "cuda":
                self.openpose_model.preprocessor.body_estimation.model.to(self.device)
                self.pipe.to(self.device)
                self.pipe.unet_encoder.to(self.device)

            if auto_mask:
                keypoints = self.openpose_model(person_img.resize((384, 512)))
                model_parse, _ = self.parsing_model(person_img.resize((384, 512)))
                mask, mask_gray = get_mask_location('hd', "upper_body", model_parse, keypoints)
                mask = mask.resize((768, 1024))
            else:
                mask = Image.new("L", (768, 1024), 255)

            from detectron2.data.detection_utils import convert_PIL_to_numpy

            keypoints = self.openpose_model(person_img.resize((384, 512)))
            model_parse, _ = self.parsing_model(person_img.resize((384, 512)))
            mask, mask_gray = get_mask_location('hd', "upper_body", model_parse, keypoints)
            mask = mask.resize((768, 1024))

            densepose = apply_net.apply_net_image(person_img, IDM_VTON_PATH / "gradio_demo")

            generator = torch.Generator(self.device).manual_seed(seed)

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

            logger.info("Inference completed")
            return images[0]

        except Exception as e:
            logger.error(f"Error during try-on: {e}")
            raise


_idm_vton_instance = None


def get_idm_vton_model(device: str = "cuda") -> IDMVTONModel:
    global _idm_vton_instance
    if _idm_vton_instance is None:
        _idm_vton_instance = IDMVTONModel(device=device)
    return _idm_vton_instance


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/files", StaticFiles(directory="../datasets"), name="files")

UPLOADS = Path("../datasets/uploads")
GENERATED = Path("../datasets/generated")
UPLOADS.mkdir(parents=True, exist_ok=True)
GENERATED.mkdir(parents=True, exist_ok=True)

hairfast_model = None


def get_hairfast():
    global hairfast_model
    if hairfast_model is None:
        parser = get_parser()
        args = parser.parse_args([])
        args.device = "cuda"
        args.size = 1024
        args.ckpt = str(Path("../models/HairFastGAN/pretrained_models/StyleGAN/ffhq.pt").resolve())
        args.channel_multiplier = 2
        args.latent = 512
        args.n_mlp = 8
        args.batch_size = 3
        args.mixing = 0.95
        args.smooth = 5
        args.rotate_checkpoint = str(Path("../models/HairFastGAN/pretrained_models/Rotate/rotate_best.pth").resolve())
        args.blending_checkpoint = str(Path("../models/HairFastGAN/pretrained_models/Blending/checkpoint.pth").resolve())
        args.pp_checkpoint = str(Path("../models/HairFastGAN/pretrained_models/PostProcess/pp_model.pth").resolve())
        args.save_all_dir = GENERATED.resolve()
        hairfast_model = HairFast(args)
    return hairfast_model


@app.get("/")
def root():
    return {"status": "ok"}


@app.get("/api/hairstyles/shapes")
def get_shapes():
    shapes = []
    for folder in Path("../datasets").iterdir():
        if folder.is_dir() and folder.name not in ["colors", "uploads", "generated"]:
            files = list(folder.glob("*.png")) + list(folder.glob("*.jpg"))
            if files:
                shapes.append({"id": folder.name, "name": folder.name, "thumbnail": str(files[0])})
    return shapes


@app.get("/api/hairstyles/colors")
def get_colors():
    colors = []
    colors_dir = Path("../datasets/colors")
    if colors_dir.exists():
        for file in list(colors_dir.glob("*.png")) + list(colors_dir.glob("*.jpg")):
            if not any(c["id"] == file.stem for c in colors):
                colors.append({"id": file.stem, "name": file.stem, "thumbnail": str(file)})
    return colors


@app.post("/api/hairstyles/try-on")
async def hairstyle_tryon(
    face_image: UploadFile = File(...),
    shape_id: str = Form(...),
    color_id: str = Form(...),
    align: bool = Form(True)
):
    face_path = UPLOADS / f"{uuid.uuid4()}{Path(face_image.filename).suffix}"
    with open(face_path, "wb") as f:
        shutil.copyfileobj(face_image.file, f)

    shape_files = list((Path("../datasets") / shape_id).glob("*.png")) + list((Path("../datasets") / shape_id).glob("*.jpg"))
    shape_path = shape_files[0]

    color_path = Path("../datasets/colors") / f"{color_id}.png"
    if not color_path.exists():
        color_path = Path("../datasets/colors") / f"{color_id}.jpg"

    result = get_hairfast().swap(
        face_img=str(face_path),
        shape_img=str(shape_path),
        color_img=str(color_path),
        align=align,
        benchmark=False
    )

    final_image = result[0] if isinstance(result, tuple) else result
    output_path = GENERATED / f"{uuid.uuid4()}.png"

    if torch.is_tensor(final_image):
        F.to_pil_image(final_image.cpu()).save(output_path)
    else:
        final_image.save(output_path)

    return {"result": str(output_path)}


@app.post("/api/clothing/try-on")
async def clothing_tryon(
    person_image: UploadFile = File(...),
    clothing_image: UploadFile = File(...),
    num_inference_steps: int = Form(30),
    guidance_scale: float = Form(2.0),
    seed: int = Form(42)
):
    person_path = UPLOADS / f"{uuid.uuid4()}{Path(person_image.filename).suffix}"
    clothing_path = UPLOADS / f"{uuid.uuid4()}{Path(clothing_image.filename).suffix}"

    with open(person_path, "wb") as f:
        shutil.copyfileobj(person_image.file, f)
    with open(clothing_path, "wb") as f:
        shutil.copyfileobj(clothing_image.file, f)

    try:
        output_path = GENERATED / f"{uuid.uuid4()}.png"

        device = "cuda" if torch.cuda.is_available() else "cpu"
        model = get_idm_vton_model(device=device)
        result_image = model.try_on(
            person_image=str(person_path),
            garment_image=str(clothing_path),
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            seed=seed
        )

        result_image.save(output_path)

        return {"result": str(output_path)}
    except Exception as e:
        logger.error(f"Error in clothing try-on: {e}")
        return {"error": str(e)}, 500


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
