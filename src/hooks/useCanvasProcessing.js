import * as tf from "@tensorflow/tfjs";

export default function useCanvasProcessing() {
  async function preprocessImage(dataUrl) {
    const image = new Image();
    image.src = dataUrl;

    await new Promise((resolve) => {
      image.onload = resolve;
    });

    const canvas = document.createElement("canvas");
    canvas.width = 28;
    canvas.height = 28;

    const ctx = canvas.getContext("2d");

    // draw resized sketch onto tiny 28x28 canvas
    ctx.drawImage(image, 0, 0, 28, 28);

    // get pixel data
    const imgData = ctx.getImageData(0, 0, 28, 28);

    // convert to grayscale + normalize
    const grayscale = [];
    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];
      const gray = (r + g + b) / 3 / 255; // normalize 0–1
      grayscale.push(gray);
    }

    // return tensor shape [28, 28, 1]
    const tensor = tf.tensor(grayscale, [28, 28, 1]);

    return tensor;
  }

  return { preprocessImage };
}
