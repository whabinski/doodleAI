import { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import DrawingCanvas from "../components/DrawingCanvas";
import CanvasControls from "../components/CanvasControls";
import PredictionPanel from "../components/PredictionPanel";

// Order MUST match the order used during training
const CLASS_NAMES = [
  "airplane",
  "bicycle",
  "cat",
  "fish",
  "house",
  "lightning",
  "star",
  "tree",
  "car",
];

export default function Home() {
  const canvasRef = useRef(null);

  const [prediction, setPrediction] = useState(null);
  const [model, setModel] = useState(null);
  const [modelStatus, setModelStatus] = useState("loading"); // 'loading' | 'ready' | 'error'
  const [isPredicting, setIsPredicting] = useState(false);

  // Load the TF.js model once
  useEffect(() => {
    let cancelled = false;

    async function loadModel() {
      try {
        const m = await tf.loadLayersModel("/tfjs_model/model.json");
        if (!cancelled) {
          setModel(m);
          setModelStatus("ready");
          console.log("TFJS model loaded");
        }
      } catch (err) {
        console.error("Failed to load TFJS model:", err);
        if (!cancelled) {
          setModelStatus("error");
        }
      }
    }

    loadModel();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
    setPrediction(null);
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const handlePredict = async () => {
    if (!model || modelStatus !== "ready") {
      console.warn("Model not ready yet");
      return;
    }

    if (!canvasRef.current) return;

    setIsPredicting(true);
    try {
      // 1) Export canvas image
      const dataUrl = await canvasRef.current.exportImage("png");

      // 2) Convert to [1, 28, 28, 1] tensor
      const inputTensor = await dataUrlToInputTensor(dataUrl);

      // 3) Run prediction
      const logits = model.predict(inputTensor);
      const probs = await logits.data();

      // Find top class
      let bestIdx = 0;
      for (let i = 1; i < probs.length; i++) {
        if (probs[i] > probs[bestIdx]) bestIdx = i;
      }

      setPrediction({
        label: CLASS_NAMES[bestIdx],
        confidence: probs[bestIdx],
        raw: probs,
      });

      inputTensor.dispose();
      logits.dispose();
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setIsPredicting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col items-center p-6">
      <h1 className="text-5xl font-bold text-gray-800 mb-2 tracking-tight">
        Doodle<span className="text-blue-600">AI</span>
      </h1>

      <p className="text-sm text-gray-500 mb-6">
        {modelStatus === "loading" && "Loading model…"}
        {modelStatus === "ready" &&
          "Model ready – draw a doodle and hit Predict!"}
        {modelStatus === "error" &&
          "Error loading model. Check the console for details."}
      </p>

      <div className="bg-white shadow-xl rounded-2xl p-6 w-full max-w-4xl grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Section */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="w-full flex justify-center mb-4">
            <DrawingCanvas ref={canvasRef} />
          </div>
          <CanvasControls
            onClear={handleClear}
            onUndo={handleUndo}
            onPredict={handlePredict}
          />
          {isPredicting && (
            <p className="mt-2 text-xs text-gray-500">Thinking…</p>
          )}
        </div>

        {/* Prediction Section */}
        <div className="lg:col-span-1">
          <PredictionPanel prediction={prediction} />
        </div>
      </div>
    </div>
  );
}

/**
 * Convert a canvas PNG data URL to a Tensor of shape [1, 28, 28, 1]
 * with values in [0, 1], where strokes are bright (near 1) and background near 0.
 */
async function dataUrlToInputTensor(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const off = document.createElement("canvas");
      off.width = 28;
      off.height = 28;
      const ctx = off.getContext("2d");

      // White background so we don't get transparent pixels
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, 28, 28);

      // Draw the user doodle scaled into 28x28
      ctx.drawImage(img, 0, 0, 28, 28);

      const imageData = ctx.getImageData(0, 0, 28, 28);
      const { data } = imageData; // RGBA
      const gray = new Float32Array(28 * 28);

      // Convert to grayscale and invert so strokes ≈ 1, background ≈ 0
      for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const v = (r + g + b) / 3; // 0..255
        gray[j] = (255 - v) / 255; // invert + normalize
      }

      const tensor = tf.tensor4d(gray, [1, 28, 28, 1]);
      resolve(tensor);
    };
    img.onerror = reject;
  });
}
