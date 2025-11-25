// src/components/DrawingCanvas.jsx
import { ReactSketchCanvas } from "react-sketch-canvas";
import { forwardRef } from "react";

const CANVAS_SIZE = 256; // logical resolution for the model

const DrawingCanvas = forwardRef((props, ref) => {
  return (
    <ReactSketchCanvas
      ref={ref}
      width={CANVAS_SIZE}      // logical resolution
      height={CANVAS_SIZE}
      strokeWidth={8}
      strokeColor="black"
      style={{
        width: "100%",         // fill square from GameBoard
        height: "100%",
        border: "2px solid #0f172a",
        borderRadius: "18px",
        backgroundColor: "#ffffff",
      }}
    />
  );
});

export default DrawingCanvas;
