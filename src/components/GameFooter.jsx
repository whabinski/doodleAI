// src/components/GameFooter.jsx

/**
 * GameFooter
 * ----------
 * Footer control bar for the game: displays the AI's current guess
 * and provides Undo / Clear / "Let AI guess" actions.
 *
 * Props:
 *  - aiGuessText: string describing what the AI currently thinks
 *  - isPredicting: boolean, true while the model is running a prediction
 *  - onUndo: callback to undo the last stroke on the canvas
 *  - onClear: callback to clear the entire canvas
 *  - onPredict: callback to trigger a model prediction on the current drawing
 *  - predictDisabled: boolean, disables the predict button when model isn't ready
 */
export default function GameFooter({
  aiGuessText,
  isPredicting,
  onUndo,
  onClear,
  onPredict,
  predictDisabled,
}) {
  return (
    <div className="px-6 pb-5 pt-3 border-t border-slate-800">
      {/* =========================
          DESKTOP / TABLET (sm+)
          ========================= */}
      <div className="hidden sm:flex items-center justify-between">
        {/* --- Left: Undo button --- */}
        <button
          onClick={onUndo}
          className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-medium border border-slate-600 transition"
        >
          Undo
        </button>

        {/* --- Center: AI guess text + "Let AI guess" action --- */}
        <div className="flex flex-col items-center gap-1 text-center">
          {/* Main line showing current AI guess or instructional text */}
          <p className="text-xs sm:text-sm text-slate-200 min-h-[1.25rem]">
            {aiGuessText}
          </p>

          {/* Small hint shown only while the model is running a prediction */}
          {isPredicting && (
            <p className="text-[11px] text-slate-400">Thinking…</p>
          )}

          {/* Button to trigger the model on the current drawing */}
          <button
            onClick={onPredict}
            disabled={predictDisabled}
            className="mt-1 px-5 py-1.5 rounded-full bg-blue-500 hover:bg-blue-400 disabled:bg-slate-700/70 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/40 transition"
          >
            Let AI guess
          </button>
        </div>

        {/* --- Right: Clear button --- */}
        <button
          onClick={onClear}
          className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-medium border border-slate-600 transition"
        >
          Clear
        </button>
      </div>

      {/* =========================
          MOBILE (below sm)
          ========================= */}
      <div className="flex flex-col items-center gap-2 sm:hidden">
        {/* AI guess / instructions on top */}
        <p className="text-xs text-slate-200 text-center min-h-[1.25rem]">
          {aiGuessText}
        </p>
        {isPredicting && (
          <p className="text-[11px] text-slate-400">Thinking…</p>
        )}

        {/* Button row: Undo | Let AI guess | Clear */}
        <div className="flex w-full max-w-sm items-center gap-2 mt-1">
          <button
            onClick={onUndo}
            className="flex-1 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[11px] font-medium border border-slate-600 transition"
          >
            Undo
          </button>

          <button
            onClick={onPredict}
            disabled={predictDisabled}
            className="flex-1 px-3 py-1.5 rounded-full bg-blue-500 hover:bg-blue-400 disabled:bg-slate-700/70 text-[11px] font-semibold text-white shadow-md shadow-blue-500/40 transition"
          >
            Let AI guess
          </button>

          <button
            onClick={onClear}
            className="flex-1 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-[11px] font-medium border border-slate-600 transition"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
