// src/components/GameBoard.jsx
import DrawingCanvas from "../Components/DrawingCanvas";

export default function GameBoard({ canvasRef }) {
  return (
    <div className="flex-1 w-full flex items-center justify-center px-3 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
      <div className="w-full max-w-3xl bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-center px-3 sm:px-4 py-3 sm:py-4">
        <DrawingCanvas ref={canvasRef} />
      </div>
    </div>
  );
}
