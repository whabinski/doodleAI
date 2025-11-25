// src/pages/Home.jsx
import { useRef, useState, useEffect, useRef as useRefHook } from "react";
import useCanvasProcessing from "../hooks/useCanvasProcessing";
import GameHeader from "../components/GameHeader";
import GameFooter from "../components/GameFooter";
import GameBoard from "../components/GameBoard";
import { useModel, CLASS_NAMES } from "../hooks/useModel";

export default function Home() {
  const canvasRef = useRef(null);
  const { preprocessImage } = useCanvasProcessing();

  // Bag of prompts for the current “cycle”
  const promptBagRef = useRefHook([]);

  const [prediction, setPrediction] = useState(null);
  const [isPredicting, setIsPredicting] = useState(false);

  // Game state
  const [targetClass, setTargetClass] = useState(null);
  const [score, setScore] = useState(0);
  const [lastResult, setLastResult] = useState(null);

  // Dynamic canvas size (CSS pixels for the square container)
  const [canvasSize, setCanvasSize] = useState(0);

  // ---- Use shared model hook ----
  const { model, status: modelStatus } = useModel();

  // --- Compute square canvas size from viewport ---
  useEffect(() => {
    function computeCanvasSize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Approx header + footer + spacing
      const reservedVertical = vh < 768 ? 260 : 220;

      const availableHeight = Math.max(140, vh - reservedVertical);
      const availableWidth = Math.max(140, vw - 40); // side padding

      let base = Math.min(availableWidth, availableHeight);
      const size = Math.max(220, Math.min(base, 600)); // clamp

      setCanvasSize(size);
    }

    computeCanvasSize();
    window.addEventListener("resize", computeCanvasSize);
    window.addEventListener("orientationchange", computeCanvasSize);
    return () => {
      window.removeEventListener("resize", computeCanvasSize);
      window.removeEventListener("orientationchange", computeCanvasSize);
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


  // Fisher–Yates shuffle (keep at bottom or above Home)
  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Get the next prompt in a “bag” so each class appears once per cycle
  const getNextPrompt = () => {
    if (!promptBagRef.current || promptBagRef.current.length === 0) {
      // Refill with a shuffled copy of all classes
      promptBagRef.current = shuffleArray(CLASS_NAMES);
    }
    // Take one from the front
    return promptBagRef.current.shift();
  };

  const startNewRound = () => {
    if (!model || modelStatus !== "ready") return;
    const next = getNextPrompt();
    setTargetClass(next);
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

      // Empty check – if almost all background, tell user to draw
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

      const inputTensor = imgTensor.expandDims(0); // [1, 28, 28, 1]
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
    <div
      className="
        h-[100dvh] w-full
        bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950
        text-slate-100
        flex flex-col
        overflow-hidden
        pt-safe pb-safe
      "
    >
      <GameHeader
        score={score}
        targetClass={targetClass}
        targetLabelPretty={targetLabelPretty}
        modelStatus={modelStatus}
        onStartNewRound={startNewRound}
      />

      <main className="flex-1 min-h-0 w-full flex items-center justify-center px-2 sm:px-4">
        <div className="game-root-inner w-full max-w-5xl flex flex-col items-center">
          <GameBoard canvasRef={canvasRef} canvasSize={canvasSize} />
        </div>
      </main>

      <GameFooter
        aiGuessText={aiGuessText}
        isPredicting={isPredicting}
        onUndo={handleUndo}
        onClear={handleClear}
        onPredict={handlePredict}
        predictDisabled={predictDisabled}
      />
    </div>
  );
}
