import { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import useCanvasProcessing from "../hooks/useCanvasProcessing";
import GameHeader from "../components/layout/GameHeader";
import GameFooter from "../components/layout/GameFooter";
import GameBoard from "../components/layout/GameBoard";


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
  const { preprocessImage } = useCanvasProcessing();

  const [prediction, setPrediction] = useState(null);
  const [model, setModel] = useState(null);
  const [modelStatus, setModelStatus] = useState("loading");
  const [isPredicting, setIsPredicting] = useState(false);

  // Game state
  const [targetClass, setTargetClass] = useState(null);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [lastResult, setLastResult] = useState(null);

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
    setLastResult(null);
  };

  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  const startNewRound = () => {
    if (!model || modelStatus !== "ready") return;
    const next =
      CLASS_NAMES[Math.floor(Math.random() * CLASS_NAMES.length)];
    setTargetClass(next);
    setRound((r) => r + 1);
    setLastResult(null);
    setPrediction(null);
    canvasRef.current?.clearCanvas();
  };

  const handlePredict = async () => {
    if (!model || modelStatus !== "ready") {
      console.warn("Model not ready yet");
      return;
    }
    if (!targetClass) {
      console.warn("No target prompt yet, starting a new round.");
      startNewRound();
      return;
    }
    if (!canvasRef.current) return;

    setIsPredicting(true);
    try {
      const dataUrl = await canvasRef.current.exportImage("png");
      const imgTensor = await preprocessImage(dataUrl);

      const mean = (await imgTensor.mean().data())[0];
      if (mean < 0.01) {
        setLastResult({
          success: false,
          target: targetClass,
          predicted: null,
          confidence: 0,
          reason: "no_drawing",
        });
        imgTensor.dispose();
        setIsPredicting(false);
        return;
      }

      const inputTensor = imgTensor.expandDims(0);
      const logits = model.predict(inputTensor);
      const probs = await logits.data();

      let bestIdx = 0;
      for (let i = 1; i < probs.length; i++) {
        if (probs[i] > probs[bestIdx]) bestIdx = i;
      }
      const predictedLabel = CLASS_NAMES[bestIdx];
      const confidence = probs[bestIdx];

      const success = predictedLabel === targetClass;
      if (success) {
        setScore((s) => s + 1);
      }

      setPrediction({
        label: predictedLabel,
        confidence,
        raw: probs,
      });

      setLastResult({
        success,
        target: targetClass,
        predicted: predictedLabel,
        confidence,
      });

      imgTensor.dispose();
      inputTensor.dispose();
      logits.dispose();
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setIsPredicting(false);
    }
  };

  const targetLabelPretty = targetClass
    ? targetClass.charAt(0).toUpperCase() + targetClass.slice(1)
    : null;

  const aiGuessText = (() => {
    if (lastResult && lastResult.reason === "no_drawing") {
      return "I don't see anything yet — try drawing first.";
    }
    if (!prediction) {
      return "Draw something, then let the AI guess!";
    }
    return `${prediction.label} (${(prediction.confidence * 100).toFixed(
      1
    )}%)`;
  })();

  const predictDisabled = modelStatus !== "ready" || isPredicting;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col">
      {/* Header extracted */}
      <GameHeader
        round={round}
        score={score}
        targetClass={targetClass}
        targetLabelPretty={targetLabelPretty}
        modelStatus={modelStatus}
        onStartNewRound={startNewRound}
      />

      {/* Middle: big board with centered canvas (unchanged) */}
      <main className="flex-1 w-full flex items-center justify-center px-4 pb-8">
      <div className="w-full max-w-5xl bg-slate-900/70 border border-slate-800/80 rounded-3xl shadow-[0_32px_80px_rgba(0,0,0,0.6)] flex flex-col">
        <GameBoard canvasRef={canvasRef} />

      {/* Footer extracted */}
      <GameFooter
        aiGuessText={aiGuessText}
        isPredicting={isPredicting}
        onUndo={handleUndo}
        onClear={handleClear}
        onPredict={handlePredict}
        predictDisabled={predictDisabled}
      />
      </div>
      </main>
    </div>
  );
}
