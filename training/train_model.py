import os
import json
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models # type: ignore
from tqdm import tqdm

CLASSES = [
    "airplane", "bicycle", "cat", "fish", "house",
    "lightning", "star", "tree", "car"
]

# =============================
# Load & preprocess NDJSON files
# =============================
def load_quickdraw_class(label):
    path = f"dataset/{label}.ndjson"
    X = []

    with open(path, "r") as f:
        for line in f:
            sample = json.loads(line)
            if len(X) > 20000:
                break
            img = sample_to_image(sample["drawing"])
            X.append(img)

    print(f"Loaded {len(X)} samples for {label}")
    return np.array(X)

# Convert strokes to 28x28 image
def sample_to_image(strokes):
    img = np.zeros((28,28))
    for stroke in strokes:
        xs, ys = stroke
        for i in range(len(xs)-1):
            x1, y1 = xs[i], ys[i]
            x2, y2 = xs[i+1], ys[i+1]
            draw_line(img, x1, y1, x2, y2)
    return img.reshape(28,28,1) / 255.0

# Bresenham line
def draw_line(img, x0, y0, x1, y1):
    x0, y0, x1, y1 = map(int, (x0/10, y0/10, x1/10, y1/10))
    dx = abs(x1-x0)
    dy = abs(y1-y0)
    sx = 1 if x0 < x1 else -1
    sy = 1 if y0 < y1 else -1
    err = dx-dy

    while True:
        if 0<=x0<28 and 0<=y0<28:
            img[y0, x0] = 255
        if x0 == x1 and y0 == y1:
            break
        e2 = 2*err
        if e2 > -dy:
            err -= dy
            x0 += sx
        if e2 < dx:
            err += dx
            y0 += sy

# =============================
# Build model
# =============================
model = models.Sequential([
    layers.Conv2D(32, (3, 3), activation="relu", input_shape=(28, 28, 1)),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(64, (3, 3), activation="relu"),
    layers.BatchNormalization(),
    layers.MaxPooling2D((2, 2)),

    layers.Conv2D(128, (3, 3), activation="relu"),
    layers.BatchNormalization(),
    layers.GlobalAveragePooling2D(),

    layers.Dropout(0.4),
    layers.Dense(128, activation="relu"),
    layers.Dropout(0.3),
    layers.Dense(len(CLASSES), activation="softmax"),
])

model.compile(
    optimizer=tf.keras.optimizers.Adam(learning_rate=1e-3),
    loss="sparse_categorical_crossentropy",
    metrics=["accuracy"],
)

# =============================
# Load dataset
# =============================
X, y = [], []

for idx, cls in enumerate(CLASSES):
    samples = load_quickdraw_class(cls)
    X.append(samples)
    y.append(np.full(samples.shape[0], idx))

X = np.vstack(X)
y = np.concatenate(y)

print("Final dataset size:", X.shape, y.shape)

# =============================
# Train
# =============================
callbacks = [
    tf.keras.callbacks.EarlyStopping(
        monitor="val_accuracy",
        patience=3,
        restore_best_weights=True
    )
]

history = model.fit(
    X, y,
    batch_size=128,        # bigger batch for speed
    epochs=30,             # let ES stop us early
    validation_split=0.1,
    shuffle=True,
    callbacks=callbacks,
)



# =============================
# Save Keras model (for backup / future use)
# =============================
os.makedirs("tfjs_model", exist_ok=True)
keras_path = os.path.join("tfjs_model", "keras_model.h5")
model.save(keras_path)
print(f"Saved Keras model to {keras_path}")

# =============================
# Export TensorFlow.js model (for React app)
# =============================
import tensorflowjs as tfjs

output_dir = os.path.join("..", "public", "tfjs_model")
os.makedirs(output_dir, exist_ok=True)

tfjs.converters.save_keras_model(model, output_dir)
print(f"Saved TFJS model to {output_dir}")
