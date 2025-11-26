// src/hooks/useCanvasProcessing.js

// TensorFlow.js library
import * as tf from "@tensorflow/tfjs";

/**
 * useCanvasProcessing
 * -------------------
 * Hook that converts a canvas PNG data URL into
 * a centered, normalized 28×28×1 tensor compatible with the model.
 *
 * - Draw at a higher resolution (256×256) to find/detect strokes.
 * - Detect the bounding box of strokes
 * - Crop + scale that box into 28×28.
 * - Convert to grayscale, invert and normalize to [0, 1].
 */
export default function useCanvasProcessing() {
  async function preprocessImage(dataUrl) {
    // ---- 1. Load the exported canvas image into an HTMLImageElement ----
    const img = new Image();
    img.src = dataUrl;

    // Wait for the image to finish loading (or error)
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // ---- 2. Draw into a higher-resolution offscreen canvas ----
    // This makes it easier to find the bounding box with better precision.
    const WORK_SIZE = 256; // working resolution (pixels)
    const src = document.createElement("canvas");
    src.width = WORK_SIZE;
    src.height = WORK_SIZE;
    const srcCtx = src.getContext("2d");

    // Start with a white background so "empty" = white pixels
    srcCtx.fillStyle = "white";
    srcCtx.fillRect(0, 0, WORK_SIZE, WORK_SIZE);

    // Draw the original doodle stretched into the 256×256 canvas
    srcCtx.drawImage(img, 0, 0, WORK_SIZE, WORK_SIZE);

    // Read back pixel data: Uint8ClampedArray [R, G, B, A, ...]
    const srcData = srcCtx.getImageData(0, 0, WORK_SIZE, WORK_SIZE);
    const d = srcData.data;

    // ---- 3. Find the bounding box of doodle ----
    // Initialize bounds so we can shrink/grow them as we see ink.
    let minX = WORK_SIZE,
      minY = WORK_SIZE;
    let maxX = -1,
      maxY = -1;

    for (let y = 0; y < WORK_SIZE; y++) {
      for (let x = 0; x < WORK_SIZE; x++) {
        const idx = (y * WORK_SIZE + x) * 4;
        const r = d[idx];
        const g = d[idx + 1];
        const b = d[idx + 2];

        // Compute a simple brightness (average of R/G/B)
        const v = (r + g + b) / 3; // 0..255

        // Treat pixels that are not “almost white” as ink
        // (v < 250) => likely part of the drawing stroke.
        if (v < 250) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    // ---- 4. If we never saw any ink, return an all-zero tensor ----
    // This lets the caller detect "empty canvas" cases.
    if (maxX < 0 || maxY < 0) {
      // Shape [28, 28, 1], values all 0
      return tf.zeros([28, 28, 1]);
    }

    // ---- Add some padding around the detected box ----
    // This prevents strokes from being cut off at the crop boundary.
    const PAD = 10;
    minX = Math.max(0, minX - PAD);
    minY = Math.max(0, minY - PAD);
    maxX = Math.min(WORK_SIZE - 1, maxX + PAD);
    maxY = Math.min(WORK_SIZE - 1, maxY + PAD);

    const boxW = maxX - minX + 1;
    const boxH = maxY - minY + 1;

    // ---- 5. Draw the bounding box into a 28×28 canvas ----
    // This performs the actual downscaling to the model's input size.
    const dst = document.createElement("canvas");
    dst.width = 28;
    dst.height = 28;
    const dstCtx = dst.getContext("2d");

    // Enable smoothing for nicer downscaling
    dstCtx.imageSmoothingEnabled = true;

    // Fill with white background
    dstCtx.fillStyle = "white";
    dstCtx.fillRect(0, 0, 28, 28);

    // Draw only the bounding box from the source into the 28×28 region
    dstCtx.drawImage(
      src,
      minX,
      minY,
      boxW,
      boxH, 
      0,
      0,
      28,
      28
    );

    // Get the 28×28 pixel data and convert it to grayscale values
    const dstData = dstCtx.getImageData(0, 0, 28, 28);
    const data = dstData.data;
    const gray = new Float32Array(28 * 28);

    // ---- 6. Grayscale + invert + normalize ----
    // Background ≈ 0, strokes ≈ 1, to match training.
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Average to grayscale (0..255)
      const v = (r + g + b) / 3;

      // Invert + normalize:
      //  - White (255) => (255 - 255)/255 = 0
      //  - Black (0)   => (255 - 0)/255   = 1
      gray[j] = (255 - v) / 255;
    }

    // ---- 7. Build and return a [28, 28, 1] tensor ----
    const tensor = tf.tensor(gray, [28, 28, 1]);
    return tensor;
  }
  
  return { preprocessImage };
}
