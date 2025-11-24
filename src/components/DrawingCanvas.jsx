// src/components/DrawingCanvas.jsx
import { ReactSketchCanvas } from "react-sketch-canvas";
import { forwardRef } from "react";

const CANVAS_SIZE = 350; // logical drawing resolution for the model

const DrawingCanvas = forwardRef((props, ref) => {
  return (
    // Fill whatever size GameBoard gives us
    <div className="w-full h-full flex items-center justify-center">
      <ReactSketchCanvas
        ref={ref}
        width={`${CANVAS_SIZE}px`}   // logical resolution (unchanged)
        height={`${CANVAS_SIZE}px`}
        strokeWidth={8}
        strokeColor="black"
        style={{
          width: "100%",             // visually fill wrapper
          height: "100%",
          border: "2px solid #ccc",
          borderRadius: "12px",
          backgroundColor: "#ffffff",
        }}
      />
    </div>
  );
});

export default DrawingCanvas;
