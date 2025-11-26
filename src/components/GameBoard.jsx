// src/components/GameBoard.jsx

import DrawingCanvas from "./DrawingCanvas";

/**
 * GameBoard
 * ---------
 * Props:
 *  - canvasRef: React reference object passed to the DrawingCanvas
 *  - canvasSize: number (in CSS pixels) for the square drawing area.
 *  - strokeWidth: number for the brush thickness passed to the canvas.
 */
export default function GameBoard({ canvasRef, canvasSize, strokeWidth }) {
  if (!canvasSize) return null;

  return (
    <section className="flex-1 min-h-0 flex items-center justify-center px-2 pt-3 sm:px-6 sm:pt-6 pb-2 sm:pb-4">
      {/* Outer card that visually frames the drawing area */}
      <div className="w-full max-w-[900px] bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-center px-3 sm:px-4 py-3 sm:py-4">
        {/* Square container whose size is controlled via inline style */}
        <div
          className="flex items-center justify-center"
          style={{
            width: `${canvasSize}px`,
            height: `${canvasSize}px`,
            // Safety clamps so the canvas doesn't overflow its card
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          {/* Actual drawing surface component.
              - `ref` is used by Home.jsx to issue commands (clear, undo, export).
              - `strokeWidth` determines how thick lines are drawn. */}
          <DrawingCanvas ref={canvasRef} strokeWidth={strokeWidth} />
        </div>
      </div>
    </section>
  );
}
