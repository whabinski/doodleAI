// src/components/GameBoard.jsx
import DrawingCanvas from "./DrawingCanvas";

export default function GameBoard({ canvasRef }) {
  return (
    <section className="flex-1 min-h-0 flex items-center justify-center px-2 sm:px-4">
      <div className="w-full max-w-5xl h-full bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-center px-3 sm:px-4 py-3 sm:py-4">
        {/* This wrapper controls the actual drawing size */}
        <div className="w-[80vw] max-w-[420px] aspect-square flex items-center justify-center">
          <DrawingCanvas ref={canvasRef} />
        </div>
      </div>
    </section>
  );
}
