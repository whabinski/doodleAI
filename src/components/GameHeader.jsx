// src/components/GameHeader.jsx
export default function GameHeader({
  score,
  targetClass,
  targetLabelPretty,
  modelStatus,
  onStartNewRound,
}) {
  return (
    <header
      className="
        w-full px-4 sm:px-8 py-4 border-b border-slate-800 bg-slate-950/80
        flex flex-col items-center gap-3 text-center
        sm:flex-row sm:items-center sm:gap-4 sm:text-left
      "
    >
      {/* Title (left on desktop, centered on mobile) */}
      <div className="sm:min-w-[140px] flex flex-col items-center sm:items-start">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Doodle<span className="text-blue-400">AI</span>
        </h1>
        {/* Hidden on mobile, shown on sm+ */}
        <p className="hidden sm:block text-[11px] sm:text-xs text-slate-500 mt-1">
          Is your drawing good enough for the AI to guess?
        </p>
      </div>

      {/* Prompt + button (center, horizontal on all sizes) */}
      <div className="flex-1 flex items-center justify-center">
        {targetClass ? (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <p className="text-sm sm:text-base text-slate-200">
              Prompt:{" "}
              <span className="font-semibold text-blue-300">
                Draw a {targetLabelPretty}
              </span>
            </p>
            <button
              onClick={onStartNewRound}
              disabled={modelStatus !== "ready"}
              className="inline-flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-700/60 px-4 py-1.5 text-xs font-medium text-slate-100 border border-slate-600/70 transition"
            >
              New Prompt
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <p className="text-sm sm:text-base text-slate-400">
              Press{" "}
              <span className="font-semibold text-slate-100">
                Start Game
              </span>{" "}
              to get your first prompt.
            </p>
            <button
              onClick={onStartNewRound}
              disabled={modelStatus !== "ready"}
              className="inline-flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-400 disabled:bg-slate-700/60 px-4 py-1.5 text-xs font-medium text-slate-100 shadow-md shadow-blue-500/30 transition"
            >
              Start Game
            </button>
          </div>
        )}
      </div>

      {/* Score (right on desktop, centered on mobile) */}
      <div className="sm:min-w-[130px] flex justify-center sm:justify-end">
        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/40 text-blue-200 text-xs sm:text-sm">
          Score: <span className="font-semibold">{score}</span>
        </span>
      </div>
    </header>
  );
}
