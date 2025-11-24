// src/components/DrawingCanvas.jsx
import { ReactSketchCanvas } from "react-sketch-canvas";
import { forwardRef } from "react";

const CANVAS_SIZE = 350; // logical drawing resolution (used for TF model)

const DrawingCanvas = forwardRef((props, ref) => {
  return (
    <ReactSketchCanvas
      ref={ref}
      width={`${CANVAS_SIZE}px`}      // internal resolution
      height={`${CANVAS_SIZE}px`}
      strokeWidth={8}
      strokeColor="black"
      style={{
        width: "100%",               // fill the square wrapper from GameBoard
        height: "100%",
        border: "2px solid #ccc",
        borderRadius: "12px",
        backgroundColor: "#ffffff",
      }}
    />
  );
});

export default DrawingCanvas;
