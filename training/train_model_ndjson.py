import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models  # type: ignore
from tqdm import tqdm

# ====================================================
# Config
# ====================================================

# IMPORTANT: these MUST match your .ndjson filenames and order
CLASSES = [
    "airplane",
    "apple",
    "bicycle",
    "book",
    "car",
    "cat",
    "crown",
    "eiffel Tower",  # <- keep exactly as your file name
    "fish",
    "helicopter",
    "house",
    "moustache",
    "star",
    "sword",
    "spider",
]

DATASET_DIR = "dataset_ndjson"

# Use up to 70k samples per class (lower if RAM is an issue)
MAX_SAMPLES_PER_CLASS = 70000

# Use only "recognized": true drawings for cleaner data
ONLY_RECOGNIZED = True

# QuickDraw coordinates are ~0–255; we downscale by this factor
DOWNSCALE_FACTOR = 10.0  # 255/10 ≈ 25.5 < 28, so it fits nicely


# ====================================================
# Loading & preprocessing
# ====================================================

def load_quickdraw_class(label: str) -> np.ndarray:
    """
    Load up to MAX_SAMPLES_PER_CLASS drawings for a given label
    from dataset/<label>.ndjson and convert each to a 28x28 image.
    """
    path = os.path.join(DATASET_DIR, f"{label}.ndjson")
    X = []

    print(f"\nLoading class '{label}' from {path}")
    with open(path, "r") as f:
        for line in tqdm(f, unit="samples"):
            sample = json.loads(line)

            if ONLY_RECOGNIZED and not sample.get("recognized", False):
                continue

            img = sample_to_image(sample["drawing"])
            X.append(img)

            if len(X) >= MAX_SAMPLES_PER_CLASS:
                break

    # normalize to 0–1
    X = np.array(X, dtype=np.float32) / 255.0
    print(f"Loaded {X.shape[0]} samples for '{label}'")
    return X


def sample_to_image(strokes) -> np.ndarray:
    """
    Convert a QuickDraw 'drawing' (list of strokes) into a 28x28 uint8 image.
    Each stroke is [xs, ys] with coordinates in ~0..255.
    """
    img = np.zeros((28, 28), dtype=np.uint8)

    for stroke in strokes:
        xs, ys = stroke
        for i in range(len(xs) - 1):
            x1, y1 = xs[i], ys[i]
            x2, y2 = xs[i + 1], ys[i + 1]
            draw_line(img, x1, y1, x2, y2)

    # shape (28, 28, 1); divide by 255 later
    return img.reshape(28, 28, 1)


def draw_line(img: np.ndarray, x0, y0, x1, y1):
    """
    Bresenham line algorithm on a 28x28 grid.
    We downscale QuickDraw coordinates by DOWNSCALE_FACTOR.
    """
    x0, y0, x1, y1 = map(
        int,
        (
            x0 / DOWNSCALE_FACTOR,
            y0 / DOWNSCALE_FACTOR,
            x1 / DOWNSCALE_FACTOR,
            y1 / DOWNSCALE_FACTOR,
        ),
    )
    dx = abs(x1 - x0)
    dy = abs(y1 - y0)
    sx = 1 if x0 < x1 else -1
    sy = 1 if y0 < y1 else -1
    err = dx - dy

    while True:
        if 0 <= x0 < 28 and 0 <= y0 < 28:
            img[y0, x0] = 255
        if x0 == x1 and y0 == y1:
            break
        e2 = 2 * err
        if e2 > -dy:
            err -= dy
            x0 += sx
        if e2 < dx:
            err += dx
            y0 += sy


# ====================================================
# Build model (NO RandomRotation / RandomTranslation)
# ====================================================

def build_model(num_classes: int) -> tf.keras.Model:
    model = models.Sequential(
        [
            layers.Input(shape=(28, 28, 1)),

            layers.Conv2D(32, (3, 3), activation="relu", padding="same"),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),

            layers.Conv2D(64, (3, 3), activation="relu", padding="same"),
            layers.BatchNormalization(),
            layers.MaxPooling2D((2, 2)),

            layers.Conv2D(128, (3, 3), activation="relu", padding="same"),
            layers.BatchNormalization(),
            layers.GlobalAveragePooling2D(),

            layers.Dropout(0.4),
            layers.Dense(128, activation="relu"),
            layers.Dropout(0.3),
            layers.Dense(num_classes, activation="softmax"),
        ]
    )

    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=5e-4),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


# ====================================================
# Load dataset
# ====================================================

X_list = []
y_list = []

for idx, cls in enumerate(CLASSES):
    samples = load_quickdraw_class(cls)
    X_list.append(samples)
    y_list.append(np.full(samples.shape[0], idx, dtype=np.int64))

X = np.vstack(X_list)
y = np.concatenate(y_list)

print("\nFinal dataset size:", X.shape, y.shape)

# ====================================================
# Train
# ====================================================

model = build_model(num_classes=len(CLASSES))
model.summary()

callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor="val_loss",      # <--- changed from val_accuracy
        patience=4,
        restore_best_weights=True,
    )
]

history = model.fit(
    X,
    y,
    batch_size=256,
    epochs=40,
    validation_split=0.1,
    shuffle=True,
    callbacks=callbacks,
)

# ====================================================
# Save Keras model (for backup / future use)
# ====================================================

os.makedirs("tfjs_model", exist_ok=True)
keras_path = os.path.join("tfjs_model", "keras_model.h5")
model.save(keras_path)
print(f"\nSaved Keras model to {keras_path}")

# ====================================================
# Export TensorFlow.js model (for React app)
# ====================================================

import tensorflowjs as tfjs  # type: ignore

output_dir = os.path.join("..", "public", "tfjs_model")
os.makedirs(output_dir, exist_ok=True)

tfjs.converters.save_keras_model(model, output_dir)
print(f"Saved TFJS model to {output_dir}")