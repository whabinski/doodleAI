// src/components/GameHeader.jsx
export default function GameHeader({
  score,
  targetClass,
  targetLabelPretty,
  modelStatus,      // still passed in from Home, but not shown
  onStartNewRound,
}) {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/80 px-4 sm:px-8 py-4">
      <div className="relative flex flex-col items-center gap-3 md:flex-row md:items-center md:justify-between">
        {/* Title (left) */}
        <div className="min-w-[140px] flex flex-col items-center md:items-start">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-center md:text-left">
            Doodle<span className="text-blue-400">AI</span>
          </h1>
          <p className="hidden sm:block text-[11px] sm:text-xs text-slate-500 mt-1 text-center md:text-left">
            Is your drawing good enough for the AI to guess?
          </p>
        </div>

        {/* Prompt + button (center) */}
        <div
          className="
            mt-1 flex flex-col items-center gap-2
            md:mt-0
            md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
          "
        >
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

        {/* Score (right) */}
        <div className="mt-2 md:mt-0 min-w-[130px] flex justify-center md:justify-end">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/40 text-blue-200 text-xs sm:text-sm">
            Score: <span className="font-semibold">{score}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
