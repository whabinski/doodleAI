// src/components/DrawingCanvas.jsx
import { ReactSketchCanvas } from "react-sketch-canvas";
import { forwardRef } from "react";

const CANVAS_SIZE = 350; // logical resolution for the model

const DrawingCanvas = forwardRef((props, ref) => {
  return (
    <ReactSketchCanvas
      ref={ref}
      width={`${CANVAS_SIZE}px`}   // logical resolution
      height={`${CANVAS_SIZE}px`}
      strokeWidth={8}
      strokeColor="black"
      style={{
        width: "100%",             // fill the square container from GameBoard
        height: "100%",
        border: "2px solid #0f172a",   // slate-900-ish
        borderRadius: "18px",
        backgroundColor: "#ffffff",
      }}
    />
  );
});

export default DrawingCanvas;
