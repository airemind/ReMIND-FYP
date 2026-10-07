from transformers import BlipProcessor, BlipForConditionalGeneration
from PIL import Image
import torch

# Device
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

processor = None
model = None


def get_model():
    global processor, model
    if processor is None or model is None:
        try:
            MODEL_NAME = "Salesforce/blip-image-captioning-base"
            processor = BlipProcessor.from_pretrained(MODEL_NAME)
            model = BlipForConditionalGeneration.from_pretrained(MODEL_NAME)
            model.to(DEVICE)
            model.eval()
        except Exception as e:
            print(f"Failed to load BLIP model: {e}")
            return None, None
    return processor, model


# Generate caption
def generate_caption(image_path: str) -> str:
    try:
        proc, mod = get_model()
        if proc is None or mod is None:
            return "A captured photo memory."

        image = Image.open(image_path).convert("RGB")
        inputs = proc(image, return_tensors="pt")
        inputs = {k: v.to(DEVICE) for k, v in inputs.items()}
        with torch.no_grad():
            output_ids = mod.generate(
                **inputs,
                max_new_tokens=50,
                num_beams=3,
                early_stopping=True,
                repetition_penalty=1.2,
            )
        caption = proc.decode(output_ids[0], skip_special_tokens=True)
        return caption.strip()
    except Exception as e:
        print(f"Caption generation failed: {str(e)}")
        return "A captured photo memory."
