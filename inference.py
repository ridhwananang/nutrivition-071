import os
import json
import numpy as np
import tensorflow as tf
from huggingface_hub import snapshot_download

# ── Load model dari HF Hub ─────────────────────────────────────
local_dir   = snapshot_download(repo_id="galihkjaya/nutrivision-models", local_dir_use_symlinks=False)

with open(f"{local_dir}/brand_map.json") as f:
    BRAND_MAP = json.load(f)
with open(f"{local_dir}/item_map.json") as f:
    ITEM_MAP = json.load(f)

BRAND_NAMES = sorted(BRAND_MAP.keys())
ITEM_NAMES  = sorted(ITEM_MAP.keys())
NUM_CLASSES = len(ITEM_NAMES)

brand_model = tf.saved_model.load(f"{local_dir}/brand_saved_model")
brand_infer = brand_model.signatures["serving_default"]

menu_model  = tf.saved_model.load(f"{local_dir}/menu_saved_model")
menu_infer  = menu_model.signatures["serving_default"]

print(f"Models loaded | Brands: {BRAND_NAMES} | Items: {NUM_CLASSES} kelas")

# ── Constants ──────────────────────────────────────────────────
EFN_MEAN = tf.constant([0.485, 0.456, 0.406], dtype=tf.float32)
EFN_STD  = tf.constant([0.229, 0.224, 0.225], dtype=tf.float32)

STRIDES     = [8, 16, 32]
IMG_SIZE    = 512
FEAT_SHAPES = [(IMG_SIZE // s, IMG_SIZE // s) for s in STRIDES]

PER_CLASS_THRESH = {
    ITEM_NAMES.index("frenchfries")    : 0.20,
    ITEM_NAMES.index("friedchicken")   : 0.20,
    ITEM_NAMES.index("cola")           : 0.10,
    ITEM_NAMES.index("nuggets")        : 0.18,
    ITEM_NAMES.index("cheeseburger")   : 0.20,
    ITEM_NAMES.index("chickenburger")  : 0.20,
    ITEM_NAMES.index("beefburger")     : 0.20,
    ITEM_NAMES.index("hashbrown")      : 0.20,
}
DEFAULT_THRESH  = 0.15
IOU_THRESH_NMS  = 0.2

# ── Postprocess ────────────────────────────────
def postprocess_fcos(cls_pred, reg_pred, ctr_pred, iou_thresh=IOU_THRESH_NMS, max_dets=10):
    cls_pred = cls_pred[0].numpy()
    reg_pred = reg_pred[0].numpy()
    ctr_pred = ctr_pred[0].numpy()

    centers = []
    for (fh, fw), stride in zip(FEAT_SHAPES, STRIDES):
        for i in range(fh):
            for j in range(fw):
                centers.append([(i + 0.5) / fh, (j + 0.5) / fw])
    centers = np.array(centers)

    cy, cx = centers[:, 0], centers[:, 1]
    l, t, r, b = reg_pred[:,0], reg_pred[:,1], reg_pred[:,2], reg_pred[:,3]

    boxes = np.stack([
        np.clip(cy - t, 0, 1),
        np.clip(cx - l, 0, 1),
        np.clip(cy + b, 0, 1),
        np.clip(cx + r, 0, 1),
    ], axis=1)

    scores_all = np.max(cls_pred, axis=-1) * ctr_pred[:, 0]
    labels_all = np.argmax(cls_pred, axis=-1)

    keep = np.array([
        scores_all[i] > PER_CLASS_THRESH.get(labels_all[i], DEFAULT_THRESH)
        for i in range(len(scores_all))
    ])
    scores = scores_all[keep]
    labels = labels_all[keep]
    boxes  = boxes[keep]

    if len(boxes) == 0:
        return np.array([]), np.array([]), np.array([])

    final_boxes, final_scores, final_labels = [], [], []
    for cls_idx in range(NUM_CLASSES):
        mask = labels == cls_idx
        if not np.any(mask):
            continue
        sel = tf.image.non_max_suppression(
            boxes[mask].astype(np.float32),
            scores[mask].astype(np.float32),
            max_output_size=max_dets,
            iou_threshold=iou_thresh
        ).numpy()
        final_boxes.extend(boxes[mask][sel])
        final_scores.extend(scores[mask][sel])
        final_labels.extend([cls_idx] * len(sel))

    if len(final_boxes) == 0:
        return np.array([]), np.array([]), np.array([])

    return np.array(final_boxes), np.array(final_scores), np.array(final_labels)


# ── Predict ────────────────────────────────────────────────────
def predict(img_bytes: bytes):
    img = tf.image.decode_image(img_bytes, channels=3, expand_animations=False)

    # Model 1 — Brand
    img_brand = tf.image.resize(img, [224, 224])
    img_brand = tf.cast(img_brand, tf.float32) / 255.0
    img_brand = tf.expand_dims(img_brand, 0)
    brand_out   = brand_infer(img_brand)
    brand_pred  = list(brand_out.values())[0]
    brand_idx   = int(tf.argmax(brand_pred[0]))
    brand       = BRAND_NAMES[brand_idx]
    brand_score = float(brand_pred[0][brand_idx])

    # Model 2 — Menu
    img_menu = tf.image.resize(img, [512, 512])
    img_menu = tf.cast(img_menu, tf.float32) / 255.0
    img_menu = (img_menu - EFN_MEAN) / EFN_STD
    img_menu = tf.expand_dims(img_menu, 0)
    menu_out = menu_infer(img_menu)

    cls_pred = menu_out["cls"]
    reg_pred = menu_out["reg"]
    ctr_pred = menu_out["ctr"]

    boxes, scores, labels = postprocess_fcos(cls_pred, reg_pred, ctr_pred)

    results = []
    for box, score, label in zip(boxes, scores, labels):
        results.append({
            "label": f"{brand}-{ITEM_NAMES[label]}",
            "score": round(float(score), 4),
            "box"  : {
                "y1": round(float(box[0]), 4),
                "x1": round(float(box[1]), 4),
                "y2": round(float(box[2]), 4),
                "x2": round(float(box[3]), 4),
                }
            })

    # Urutkan hasil deteksi berdasarkan skor kecocokan tertinggi ke terendah
    results.sort(key=lambda x: x["score"], reverse=True)

    return {
        "brand"      : brand,
        "brand_score": round(brand_score, 4),
        "items"      : results
    }


# ── FastAPI ────────────────────────────────────────────────────
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="NutriVision API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message" : "NutriVision API",
        "brands"  : BRAND_NAMES,
        "n_items" : NUM_CLASSES,
    }

@app.post("/predict")
async def predict_endpoint(file: UploadFile = File(...)):
    img_bytes = await file.read()
    result    = predict(img_bytes)
    return result


# ── Run (untuk HF Spaces) ──────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
