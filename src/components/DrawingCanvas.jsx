// src/components/DrawingCanvas.jsx

import { ReactSketchCanvas } from "react-sketch-canvas";
import { forwardRef } from "react";

// Logical underlying resolution used for the model input.
const CANVAS_SIZE = 256;

/**
 * DrawingCanvas
 * -------------
 * Thin wrapper around ReactSketchCanvas.
 *
 * - Uses a fixed logical resolution (256x256) so the exported image
 *   is consistent for the model.
 * - Visually stretches to fill whatever size its parent gives it.
 *
 * Props:
 *  - strokeWidth: brush thickness (in canvas pixels) used when drawing.
 */
const DrawingCanvas = forwardRef(({ strokeWidth = 12 }, ref) => {
  return (
    <ReactSketchCanvas
      // Forward the ref so the parent can call imperative methods
      ref={ref}
      // Logical drawing resolution for the sketch surface
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      // Dynamic brush thickness
      strokeWidth={strokeWidth}
      // Black ink on white background (matches training images)
      strokeColor="black"
      // Make the canvas responsive inside its container
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
