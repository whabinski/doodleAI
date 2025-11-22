// src/hooks/useCanvasProcessing.js
import * as tf from "@tensorflow/tfjs";

export default function useCanvasProcessing() {
  async function preprocessImage(dataUrl) {
    const img = new Image();
    img.src = dataUrl;

    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
    });

    // 1. Draw the exported canvas image into a larger offscreen canvas
    const WORK_SIZE = 256; // working resolution
    const src = document.createElement("canvas");
    src.width = WORK_SIZE;
    src.height = WORK_SIZE;
    const srcCtx = src.getContext("2d");

    // White background
    srcCtx.fillStyle = "white";
    srcCtx.fillRect(0, 0, WORK_SIZE, WORK_SIZE);

    // Draw the doodle scaled to this working size
    srcCtx.drawImage(img, 0, 0, WORK_SIZE, WORK_SIZE);

    const srcData = srcCtx.getImageData(0, 0, WORK_SIZE, WORK_SIZE);
    const d = srcData.data;

    // 2. Find bounding box of "ink" (non-white pixels)
    let minX = WORK_SIZE, minY = WORK_SIZE;
    let maxX = -1, maxY = -1;

    for (let y = 0; y < WORK_SIZE; y++) {
      for (let x = 0; x < WORK_SIZE; x++) {
        const idx = (y * WORK_SIZE + x) * 4;
        const r = d[idx];
        const g = d[idx + 1];
        const b = d[idx + 2];

        const v = (r + g + b) / 3; // brightness 0..255

        // treat near-white as background; anything darker is ink
        if (v < 250) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    // 3. If no ink found, return all-zeros [28, 28, 1]
    if (maxX < 0 || maxY < 0) {
      return tf.zeros([28, 28, 1]);
    }

    // Add a bit of padding around the doodle
    const PAD = 10;
    minX = Math.max(0, minX - PAD);
    minY = Math.max(0, minY - PAD);
    maxX = Math.min(WORK_SIZE - 1, maxX + PAD);
    maxY = Math.min(WORK_SIZE - 1, maxY + PAD);

    const boxW = maxX - minX + 1;
    const boxH = maxY - minY + 1;

    // 4. Draw the bounding box region into a 28x28 canvas
    const dst = document.createElement("canvas");
    dst.width = 28;
    dst.height = 28;
    const dstCtx = dst.getContext("2d");

    dstCtx.fillStyle = "white";
    dstCtx.fillRect(0, 0, 28, 28);

    dstCtx.drawImage(
      src,
      minX,
      minY,
      boxW,
      boxH, // source box
      0,
      0,
      28,
      28 // destination 28x28
    );

    const dstData = dstCtx.getImageData(0, 0, 28, 28);
    const data = dstData.data;
    const gray = new Float32Array(28 * 28);

    // 5. Grayscale + invert + normalize -> bg≈0, strokes≈1
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const v = (r + g + b) / 3; // 0..255

      gray[j] = (255 - v) / 255; // invert + normalize
    }

    // Return [28, 28, 1] (NO batch dim here)
    const tensor = tf.tensor(gray, [28, 28, 1]);
    return tensor;
  }

  return { preprocessImage };
}
