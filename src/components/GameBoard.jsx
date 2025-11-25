// src/components/GameBoard.jsx
import DrawingCanvas from "./DrawingCanvas";

export default function GameBoard({ canvasRef, canvasSize, strokeWidth }) {
  if (!canvasSize) return null;

  return (
    <section className="flex-1 min-h-0 flex items-center justify-center px-2 pt-3 sm:px-6 sm:pt-6 pb-2 sm:pb-4">
      <div className="w-full max-w-[900px] bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-center px-3 sm:px-4 py-3 sm:py-4">
        <div
          className="flex items-center justify-center"
          style={{
            width: `${canvasSize}px`,
            height: `${canvasSize}px`,
            maxWidth: "100%",
            maxHeight: "100%",
          }}
        >
          <DrawingCanvas ref={canvasRef} strokeWidth={strokeWidth} />
        </div>
      </div>
    </section>
  );
}
