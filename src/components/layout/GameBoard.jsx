// src/components/layout/GameBoard.jsx
import DrawingCanvas from "../DrawingCanvas";

export default function GameBoard({ canvasRef }) {
  return (
    <>
      {/* Canvas region */}
      <div className="flex-1 flex items-center justify-center px-6 pt-6 pb-4">
        <div className="w-full max-w-[900px] aspect-[4/3] md:aspect-[16/9] bg-slate-950/70 rounded-2xl border border-slate-800 flex items-center justify-center">
          <div className="w-[90%] h-[90%] flex items-center justify-center">
            <DrawingCanvas ref={canvasRef} />
          </div>
        </div>
      </div>
    </>
  );
}
