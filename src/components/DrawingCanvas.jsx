// src/components/DrawingCanvas.jsx
import { ReactSketchCanvas } from "react-sketch-canvas";
import { forwardRef } from "react";

const CANVAS_SIZE = 256; // logical resolution for the model

const DrawingCanvas = forwardRef(({ strokeWidth = 12 }, ref) => {
  return (
    <ReactSketchCanvas
      ref={ref}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      strokeWidth={strokeWidth}       // <-- now dynamic
      strokeColor="black"
      style={{
        width: "100%",
        height: "100%",
        border: "2px solid #0f172a",
        borderRadius: "18px",
        backgroundColor: "#ffffff",
      }}
    />
  );
});

export default DrawingCanvas;
