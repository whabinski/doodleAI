// src/pages/Home.jsx

// React hooks
import { useRef, useState, useEffect } from "react";

// Custom hook that turns a canvas image into a 28x28 tensor for the model
import useCanvasProcessing from "../hooks/useCanvasProcessing";
// Shared model hook and prompt labels used by the TFJS model
import { useModel, PROMPT_NAMES } from "../hooks/useModel";

// Layout / UI components
import GameHeader from "../components/GameHeader";
import GameFooter from "../components/GameFooter";
import GameBoard from "../components/GameBoard";

/**
 * Home
 * ----
 * Main game screen:
 * - Manages game state
 * - Controls the drawing canvas via a ref.
 * - Calls the TFJS model to classify the drawing.
 * - Decides when to start a new round, clear, undo, etc.
 */
export default function Home() {
  // Ref to the GameBoard's canvas API (clear, undo, export)
  const canvasRef = useRef(null);

  // Image preprocessing util: takes a dataURL and returns a normalized 28x28 tensor
  const { preprocessImage } = useCanvasProcessing();

  // "Bag of prompts" for the current cycle – ensures each prompt appears once before repeating
  const promptBagRef = useRef([]);

  // Last raw prediction from the model (label, confidence, raw probability array)
  const [prediction, setPrediction] = useState(null);

  // Whether a prediction is currently running (used to disable button / show spinner)
  const [isPredicting, setIsPredicting] = useState(false);

  // Game state: current target prompt the user is supposed to draw
  const [targetClass, setTargetClass] = useState(null);

  // Player score: incremented when the AI correctly guesses the target prompt
  const [score, setScore] = useState(0);

  /**
   * Last result of the "round":
   * - success: boolean (did the AI guess correctly?)
   * - target: target prompt for that round
   * - predicted: AI's guessed label
   * - confidence: probability for the predicted label
   * - reason: optional, e.g., "no_drawing" if the canvas was basically empty
   */
  const [lastResult, setLastResult] = useState(null);

  // Stroke width used by the canvas (scaled based on viewport size)
  const [strokeWidth, setStrokeWidth] = useState(12);

  // Computed canvas size (in CSS pixels) for the square drawing area
  const [canvasSize, setCanvasSize] = useState(0);

  // Shared TFJS model + loading status ("loading" | "ready" | "error")
  const { model, status: modelStatus } = useModel();

  /**
   * Compute a responsive canvas size and stroke width
   * based on current viewport dimensions.
   */
  useEffect(() => {
    // Compute a stroke width in [minStroke, maxStroke] based on canvas size
    function computeStrokeWidth(size) {
      const minStroke = 8;   // thinnest stroke for small canvases
      const maxStroke = 16;  // thickest stroke for large canvases

      // Normalize size into [0, 1] between 220px and 600px
      const t = (size - 220) / (600 - 220);
      const clamped = Math.max(0, Math.min(1, t));
      const base = minStroke + (maxStroke - minStroke) * clamped;
      return Math.round(base);
    }

    // Compute the canvas size from the current viewport (width/height)
    function computeCanvasSize() {
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Reserve vertical space for header/footer (more on small screens)
      const reservedVertical = vh < 768 ? 260 : 220;
      const availableHeight = Math.max(140, vh - reservedVertical);

      // Reserve a bit of horizontal padding
      const availableWidth = Math.max(140, vw - 40);

      // Canvas is square: take the smaller of the two
      let base = Math.min(availableWidth, availableHeight);

      // Clamp between 220 and 600 pixels for usability
      const size = Math.max(220, Math.min(base, 600));

      setCanvasSize(size);
      setStrokeWidth(computeStrokeWidth(size));
    }

    // Initial measurement
    computeCanvasSize();

    // Recompute when the viewport changes
    window.addEventListener("resize", computeCanvasSize);
    window.addEventListener("orientationchange", computeCanvasSize);

    // Cleanup listeners on unmount
    return () => {
      window.removeEventListener("resize", computeCanvasSize);
      window.removeEventListener("orientationchange", computeCanvasSize);
    };
  }, []);

  /**
   * Clear the canvas and reset the last prediction/result.
   * Does NOT change the current target prompt or score.
   */
  const handleClear = () => {
    canvasRef.current?.resetCanvas();
    setPrediction(null);
    setLastResult(null);
  };

  /**
   * Undo the last stroke on the canvas (no game state change).
   */
  const handleUndo = () => {
    canvasRef.current?.undo();
  };

  /**
   * Fisher–Yates shuffle: returns a new shuffled copy of an array.
   * Used to randomize the order in which prompts appear.
   */
  function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * Pull the next prompt from the "bag".
   * - When the bag is empty, refill it with all PROMPT_NAMES in random order.
   * - This guarantees each prompt appears once per "cycle".
   */
  const getNextPrompt = () => {
    if (!promptBagRef.current || promptBagRef.current.length === 0) {
      // Refill with a shuffled copy of all prompts
      promptBagRef.current = shuffleArray(PROMPT_NAMES);
    }
    // Remove and return the first item in the bag
    return promptBagRef.current.shift();
  };

  /**
   * Start a new round:
   * - Requires the model to be ready.
   * - Picks a new target prompt from the bag.
   * - Clears the last result/prediction and canvas.
   */
  const startNewRound = () => {
    if (!model || modelStatus !== "ready") return;

    const next = getNextPrompt();
    setTargetClass(next);
    setLastResult(null);
    setPrediction(null);
    canvasRef.current?.resetCanvas();
  };

  /**
   * Run the model on the current canvas drawing:
   * 1. Export the canvas as a PNG data URL.
   * 2. Preprocess into a 28x28 grayscale tensor.
   * 3. Reject if the image is basically empty (very low mean).
   * 4. Call model.predict and find the argmax.
   * 5. Update prediction, lastResult, and score accordingly.
   */
  const handlePredict = async () => {
    // Model guard
    if (!model || modelStatus !== "ready") {
      console.warn("Model not ready yet");
      return;
    }

    // If no target yet, auto-start a round instead of silently failing
    if (!targetClass) {
      console.warn("No target prompt yet, starting a new round.");
      startNewRound();
      return;
    }

    // Canvas guard
    if (!canvasRef.current) return;

    setIsPredicting(true);

    try {
      // 1) Export current drawing from the canvas
      const dataUrl = await canvasRef.current.exportImage("png");

      // 2) Turn PNG into normalized tensor [28, 28, 1]
      const imgTensor = await preprocessImage(dataUrl);

      // 3) Basic "empty drawing" check:
      //    If the average pixel value is tiny, assume nothing is drawn.
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

      // 4) Add batch dimension: [1, 28, 28, 1]
      const inputTensor = imgTensor.expandDims(0);

      // 5) Forward pass through TFJS model
      const logits = model.predict(inputTensor);
      const probs = await logits.data();

      // Find the index of the largest probability
      let bestIdx = 0;
      for (let i = 1; i < probs.length; i++) {
        if (probs[i] > probs[bestIdx]) bestIdx = i;
      }

      const predictedLabel = PROMPT_NAMES[bestIdx];
      const confidence = probs[bestIdx];

      // Check if guessed the target prompt correctly?
      const success = predictedLabel === targetClass;
      if (success) {
        // Increment score on correct guess
        setScore((s) => s + 1);
      }

      // Store the full prediction (for display / debugging)
      setPrediction({
        label: predictedLabel,
        confidence,
        raw: probs,
      });

      // Store "round result"
      setLastResult({
        success,
        target: targetClass,
        predicted: predictedLabel,
        confidence,
      });

      // Clean up tensors to avoid memory leaks in TFJS
      imgTensor.dispose();
      inputTensor.dispose();
      logits.dispose();
    } catch (err) {
      console.error("Prediction error:", err);
    } finally {
      setIsPredicting(false);
    }
  };

  // Capaitalize target label for display
  const targetLabelPretty = targetClass
    ? targetClass.charAt(0).toUpperCase() + targetClass.slice(1)
    : null;

  /**
   * Text describing the AI's current guess / status:
   * - If canvas is empty then encourage user to draw.
   * - If "no_drawing" then show nothing was detected.
   * - Else show "<label> (XX.X%)".
   */
  const aiGuessText = (() => {
    if (lastResult && lastResult.reason === "no_drawing") {
      return "I don't see anything yet — try drawing first.";
    }
    if (!prediction) {
      return "Draw something, then let the AI guess!";
    }
    return `${prediction.label} (${(prediction.confidence * 100).toFixed(1)}%)`;
  })();

  // Predict button is disabled while:
  // - model is not ready
  // - a prediction is in progress
  // - there is no current target prompt
  const predictDisabled =
    modelStatus !== "ready" || isPredicting || !targetClass;

  // ==============================
  // Render
  // ==============================
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
      {/* Top bar: title, status, score, and "New Round" button */}
      <GameHeader
        score={score}
        targetClass={targetClass}
        targetLabelPretty={targetLabelPretty}
        modelStatus={modelStatus}
        onStartNewRound={startNewRound}
      />

      {/* Centered drawing board */}
      <main className="flex-1 min-h-0 w-full flex items-center justify-center px-2 sm:px-4">
        <div className="game-root-inner w-full max-w-5xl flex flex-col items-center">
          <GameBoard
            canvasRef={canvasRef}
            canvasSize={canvasSize}
            strokeWidth={strokeWidth}
          />
        </div>
      </main>

      {/* Bottom bar: AI guess, undo/clear, "Let AI Guess" button */}
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
