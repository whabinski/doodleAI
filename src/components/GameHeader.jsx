// src/components/GameHeader.jsx

/**
 * GameHeader
 * ----------
 * Header UI for the game.
 *
 * Props:
 *  - score: current player score (number)
 *  - targetClass: internal name of the current target class 
 *  - targetLabelPretty: human friendly label for the target 
 *  - modelStatus: "loading" | "ready" | "error" 
 *  - onStartNewRound: callback to start a new prompt/round
 *
 */
export default function GameHeader({
  score,
  targetClass,
  targetLabelPretty,
  modelStatus,
  onStartNewRound,
}) {
  return (
    <header className="w-full border-b border-slate-800 bg-slate-950/80">
      {/* =========================
          DESKTOP / TABLET (md+)
          ========================= */}
      <div className="hidden md:block w-full px-8 py-4">
        {/* Flex row: title (left), score (right), prompt (absolutely centered) */}
        <div className="relative flex items-center">
          {/* --- Left: game title + subtitle --- */}
          <div className="min-w-[140px]">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Doodle<span className="text-blue-400">AI</span>
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-1">
              Is your drawing good enough for the AI to guess?
            </p>
          </div>

          {/* --- Right: score pill --- */}
          <div className="ml-auto min-w-[130px] flex justify-end">
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/40 text-blue-200 text-xs sm:text-sm">
              Score: <span className="font-semibold">{score}</span>
            </span>
          </div>

          {/* --- Centered prompt area --- */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
            {targetClass ? (
              <div className="inline-flex flex-wrap items-center justify-center gap-3">
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
              /* Before the first round starts */
              <div className="inline-flex flex-wrap items-center justify-center gap-3">
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
        </div>
      </div>

      {/* =========================
          MOBILE (below md)
          ========================= */}
      <div className="relative flex md:hidden flex-col items-center px-3 py-3">
        <div className="absolute right-3 top-2">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/40 text-blue-200 text-[11px]">
            Score: <span className="font-semibold">{score}</span>
          </span>
        </div>

        {/* Centered title on mobile */}
        <h1 className="text-xl font-bold tracking-tight text-center">
          Doodle<span className="text-blue-400">AI</span>
        </h1>

        {/* Tagline hidden on mobile to save vertical space */}
        <p className="hidden text-[11px] text-slate-500 mt-1 text-center">
          Is your drawing good enough for the AI to guess?
        </p>

        {/* Prompt + action button below the title */}
        <div className="mt-2 flex flex-col items-center gap-1.5">
          {targetClass ? (
            /* Mobile: active prompt state */
            <div className="flex flex-wrap items-center justify-center gap-2">
              <p className="text-sm text-slate-200 text-center">
                Prompt:{" "}
                <span className="font-semibold text-blue-300">
                  Draw a {targetLabelPretty}
                </span>
              </p>
              <button
                onClick={onStartNewRound}
                disabled={modelStatus !== "ready"}
                className="inline-flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 disabled:bg-slate-700/60 px-3 py-1.5 text-[11px] font-medium text-slate-100 border border-slate-600/70 transition"
              >
                New Prompt
              </button>
            </div>
          ) : (
            /* Mobile: pre-game state */
            <div className="flex flex-wrap items-center justify-center gap-2">
              <p className="text-sm text-slate-400 text-center">
                Press{" "}
                <span className="font-semibold text-slate-100">
                  Start Game
                </span>{" "}
                to get your first prompt.
              </p>
              <button
                onClick={onStartNewRound}
                disabled={modelStatus !== "ready"}
                className="inline-flex items-center justify-center rounded-full bg-blue-500 hover:bg-blue-400 disabled:bg-slate-700/60 px-3 py-1.5 text-[11px] font-medium text-slate-100 shadow-md shadow-blue-500/30 transition"
              >
                Start Game
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
