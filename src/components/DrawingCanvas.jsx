import { ReactSketchCanvas } from "react-sketch-canvas";
import { forwardRef } from "react";

const DrawingCanvas = forwardRef((props, ref) => {
  return (
    <div style={{ width: "350px", height: "350px" }}>
      <ReactSketchCanvas
        ref={ref}
        width="350px"
        height="350px"
        strokeWidth={8}
        strokeColor="black"
        style={{ border: "2px solid #ccc", borderRadius: "8px" }}
      />
    </div>
  );
});

export default DrawingCanvas;
