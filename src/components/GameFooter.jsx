// src/components/GameFooter.jsx
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
      {/* Desktop / tablet: Undo | AI | Clear in a row (unchanged) */}
      <div className="hidden sm:flex items-center justify-between">
        {/* Undo (left) */}
        <button
          onClick={onUndo}
          className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-medium border border-slate-600 transition"
        >
          Undo
        </button>

        {/* AI guess + button (center) */}
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-xs sm:text-sm text-slate-200 min-h-[1.25rem]">
            {aiGuessText}
          </p>
          {isPredicting && (
            <p className="text-[11px] text-slate-400">Thinking…</p>
          )}
          <button
            onClick={onPredict}
            disabled={predictDisabled}
            className="mt-1 px-5 py-1.5 rounded-full bg-blue-500 hover:bg-blue-400 disabled:bg-slate-700/70 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/40 transition"
          >
            Let AI guess
          </button>
        </div>

        {/* Clear (right) */}
        <button
          onClick={onClear}
          className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-medium border border-slate-600 transition"
        >
          Clear
        </button>
      </div>

      {/* Mobile: text on top, then 3 buttons in one row */}
      <div className="flex flex-col items-center gap-2 sm:hidden">
        {/* Top line text */}
        <p className="text-xs text-slate-200 text-center min-h-[1.25rem]">
          {aiGuessText}
        </p>
        {isPredicting && (
          <p className="text-[11px] text-slate-400">Thinking…</p>
        )}

        {/* Buttons row: Undo | Let AI guess | Clear */}
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
