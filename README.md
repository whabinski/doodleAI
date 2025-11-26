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

### Training

- Python 3  
- TensorFlow (Keras)
- tensorflowjs
- NumPy
- tqdm
- Quick, Draw! `.ndjson` dataset (not included in this repo)
