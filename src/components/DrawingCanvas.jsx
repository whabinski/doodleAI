// src/components/DrawingCanvas.jsx
import { ReactSketchCanvas } from "react-sketch-canvas";
import { forwardRef } from "react";

const CANVAS_SIZE = 350; // logical drawing resolution

const DrawingCanvas = forwardRef((props, ref) => {
  return (
    // Responsive, square wrapper
    <div
      className="
        w-full
        max-w-[min(90vw,600px)]  /* grow up to 600px, but never exceed 90% of viewport width */
        aspect-square
        flex items-center justify-center
      "
    >
      <ReactSketchCanvas
        ref={ref}
        width={`${CANVAS_SIZE}px`}     // logical resolution (keep this fixed)
        height={`${CANVAS_SIZE}px`}
        strokeWidth={8}
        strokeColor="black"
        style={{
          width: "100%",               // stretch to wrapper
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
