# DoodleAI 🖍️🤖

DoodleAI is a browser-based drawing game where you sketch a given prompt and a convolutional neural network (CNN) tries to guess what you drew. It uses the Google **Quick, Draw!** dataset for training and runs the model in the browser via **TensorFlow.js**.

> “Is your drawing good enough for the AI to guess?”

---

## Features

- 🎯 **Prompt-based game loop**  
  - The app randomly chooses a prompt for the user to draw
  - You draw it on the canvas and let the AI guess.

- 🧠 **On-device AI inference**  
  - A custom CNN trained on QuickDraw `.ndjson` data.  
  - Converted to a TFJS model and loaded in the browser (`public/tfjs_model`).

- 🖌️ **Responsive drawing experience**  
  - Canvas scales with viewport size.  
  - Stroke width automatically adapts to canvas size.  
  - Drawing is captured with `react-sketch-canvas` and preprocessed to 28×28 grayscale input.

- 🧮 **Preprocessing to match training data**  
  - Captured canvas → 256×256 working image.  
  - Bounding box of “ink” detected.  
  - Cropped, padded, rescaled to 28×28.  
  - Converted to grayscale, inverted, and normalized to `[0, 1]`.

- 🕷️ **Class vs prompt control**  
  - The model is trained on 15 classes including the following:
  - "airplane",
  - "apple",
  - "bicycle",
  - "book",
  - "car",
  - "cat",
  - "crown",
  - "eiffel Tower",
  - "fish",
  - "helicopter",
  - "house",
  - "moustache",
  - "star",
  - "sword",
  - "spider",

---

## Tech Stack

### Frontend

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [react-sketch-canvas](https://github.com/vinothpandian/react-sketch-canvas)
- [TensorFlow.js](https://www.tensorflow.org/js)

## Dataset & Training Details

- Python 3  
- TensorFlow (Keras)
- tensorflowjs
- NumPy
- tqdm
- Quick, Draw! `.ndjson` dataset (not included in this repo)


### Classes & sample counts

- Dataset source: Google’s **Quick, Draw!** simplified `.ndjson` files.  
- Classes used (15 total):  
  `["airplane", "apple", "bicycle", "book", "car", "cat", "crown", "eiffel Tower", "fish", "helicopter", "house", "moustache", "star", "sword", "spider"]`
- For each class, up to **70,000** doodles were loaded from the corresponding `.ndjson` file.  
- Total dataset size after loading: **≈ 1.0–1.05 million** examples across all 15 classes.  
- Only the simplified line-stroke drawings were used; labels come directly from the file name / class mapping in `train_model_ndjson.py`.

> The raw QuickDraw files are large and are **not committed** to this repository.

### How the samples are used

- For each `.ndjson` file:
  - Each drawing’s stroke list (`drawing`) is converted into a **28×28** grayscale bitmap using a simple rasterizer (Bresenham-style line drawing) in `train_model_ndjson.py`.
  - Pixel values are stored as `uint8` in `[0, 255]` and later normalized to `[0, 1]` via a `Rescaling(1./255)` layer in the model.
- All class-specific arrays are stacked into:
  - `X`: shape `(N, 28, 28, 1)`  
  - `y`: integer class indices in `[0, 14]`
- During training:
  - A fixed **10%** of the dataset is held out as a **validation split**.

### Model architecture

The current model is a compact CNN built with Keras:

- Input: `28×28×1` grayscale image  
- Layers (in order):
  - `Rescaling(1./255)` – normalize `[0, 255]` → `[0, 1]`
  - `Conv2D(32, 3×3, relu, padding="same")` + `BatchNormalization` + `MaxPooling2D(2×2)`
  - `Conv2D(64, 3×3, relu, padding="same")` + `BatchNormalization` + `MaxPooling2D(2×2)`
  - `Conv2D(128, 3×3, relu, padding="same")` + `BatchNormalization`
  - `GlobalAveragePooling2D`
  - `Dropout(0.5)`
  - `Dense(128, relu)`
  - `Dropout(0.4)`
  - `Dense(15, softmax)` — one logit per class

Regularization & stabilization:

- **Dropout** before and after the dense layer to reduce overfitting.  
- **Batch normalization** after each conv layer.  

### Training setup (hyperparameters)

Key training parameters used in `training/train_model_ndjson.py`:

- **Batch size:** `256`  
- **Max epochs:** `40`  
- **Optimizer:** `Adam` with initial learning rate `5e-4`  
- **Loss:** `sparse_categorical_crossentropy`  
- **Metrics:** `accuracy`  
- **Validation split:** `0.1` (10% of the dataset for validation)