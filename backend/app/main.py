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
import logging

# Add model paths
sys.path.insert(0, str(Path("../models/HairFastGAN").resolve()))
IDM_VTON_PATH = Path("../models/idm-vton-official").resolve()
sys.path.insert(0, str(IDM_VTON_PATH))
sys.path.insert(0, str(IDM_VTON_PATH / "gradio_demo"))

from hair_swap import HairFast, get_parser

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
idm_vton_model = None

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

def get_clothing_tryon():
    global idm_vton_model
    if idm_vton_model is None:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        idm_vton_model = get_idm_vton_model(device=device)
    return idm_vton_model

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

        # Use local IDM-VTON model
        model = get_clothing_tryon()
        result_image = model.try_on(
            person_image=str(person_path),
            garment_image=str(clothing_path),
            num_inference_steps=num_inference_steps,
            guidance_scale=guidance_scale,
            seed=seed
        )

        # Save result
        result_image.save(output_path)

        return {"result": str(output_path)}
    except Exception as e:
        logging.error(f"Error in clothing try-on: {e}")
        return {"error": str(e)}, 500

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
