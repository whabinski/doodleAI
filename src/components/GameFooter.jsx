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
    <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
      {/* Undo (left) */}
      <button
        onClick={onUndo}
        className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-medium border border-slate-600 transition w-full sm:w-auto"
      >
        Undo
      </button>

      {/* AI guess + button (center) */}
      <div className="flex flex-col items-center gap-1 text-center flex-1">
        <p className="text-xs sm:text-sm text-slate-200 min-h-[1.25rem]">
          {aiGuessText}
        </p>
        {isPredicting && (
          <p className="text-[11px] text-slate-400">Thinking…</p>
        )}
        <button
          onClick={onPredict}
          disabled={predictDisabled}
          className="mt-1 px-5 py-1.5 rounded-full bg-blue-500 hover:bg-blue-400 disabled:bg-slate-700/70 text-xs sm:text-sm font-semibold text-white shadow-md shadow-blue-500/40 transition w-full sm:w-auto"
        >
          Let AI guess
        </button>
      </div>

      {/* Clear (right) */}
      <button
        onClick={onClear}
        className="px-4 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-xs sm:text-sm font-medium border border-slate-600 transition w-full sm:w-auto"
      >
        Clear
      </button>
    </div>
  );
}
