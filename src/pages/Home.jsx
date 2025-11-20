import { useRef, useState } from "react";
import DrawingCanvas from "../components/DrawingCanvas";
import CanvasControls from "../components/CanvasControls";
import PredictionPanel from "../components/PredictionPanel";

export default function Home() {
  const canvasRef = useRef(null);
  const [prediction, setPrediction] = useState(null);

  const handleClear = () => {
    canvasRef.current.clearCanvas();
  };

  const handleUndo = () => {
    canvasRef.current.undo();
  };

  const handlePredict = async () => {
    const imageData = await canvasRef.current.exportImage("png");

    // TEMP: show raw image data in console
    console.log("Exported canvas PNG:", imageData);

    // soon we will:
    // 1. process image using useCanvasProcessing
    // 2. run prediction using useModel
    setPrediction({
      label: "???",
      confidence: 0,
    });
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1rem",
      marginTop: "2rem"
    }}>
      <h1>DoodleAI</h1>
      <h1 className="text-4xl font-bold text-red-500">DoodleAI</h1>


      <DrawingCanvas ref={canvasRef} />

      <CanvasControls
        onClear={handleClear}
        onUndo={handleUndo}
        onPredict={handlePredict}
      />

      <PredictionPanel prediction={prediction} />
    </div>
  );
}
