// src/components/layout/GameHeader.jsx
export default function GameHeader({
  round,
  score,
  targetClass,
  targetLabelPretty,
  modelStatus,
  onStartNewRound,
}) {
  return (
    <header className="w-full px-8 py-4 border-b border-slate-800 bg-slate-950/80 flex items-center gap-4">
      {/* Title (left) */}
      <div className="min-w-[140px]">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Doodle<span className="text-blue-400">AI</span>
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
          Make the AI guess your doodle correctly.
        </p>
      </div>

      {/* Prompt (center) */}
      <div className="flex-1 text-center">
        {targetClass ? (
          <>
            <p className="text-sm sm:text-base text-slate-200">
              Prompt:{" "}
              <span className="font-semibold text-blue-300">
                Draw a {targetLabelPretty}
              </span>
            </p>
            <button
              onClick={onStartNewRound}
              disabled={modelStatus !== "ready"}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-700/60 px-4 py-1.5 text-xs font-medium text-slate-100 border border-slate-600/70 transition"
            >
              New Prompt
            </button>
          </>
        ) : (
          <>
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
              className="mt-2 inline-flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-400 disabled:bg-slate-700/60 px-4 py-1.5 text-xs font-medium text-slate-100 shadow-md shadow-blue-500/30 transition"
            >
              Start Game
            </button>
          </>
        )}
      </div>

      {/* Score (right) */}
      <div className="min-w-[170px] flex flex-col items-end text-xs sm:text-sm gap-1">
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full bg-slate-800/60 border border-slate-700">
            Round: <span className="font-semibold">{round}</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/40 text-blue-200">
            Score: <span className="font-semibold">{score}</span>
          </span>
        </div>
        <span className="text-[11px] text-slate-500">
          {modelStatus === "loading" && "Loading model…"}
          {modelStatus === "ready" && "Model ready"}
          {modelStatus === "error" && "Model failed to load"}
        </span>
      </div>
    </header>
  );
}
