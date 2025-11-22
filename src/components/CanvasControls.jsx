export default function CanvasControls({ onClear, onUndo, onPredict }) {
  const btn =
    "px-4 py-2 rounded-lg font-medium transition bg-blue-600 text-white hover:bg-blue-700 active:scale-95";

  return (
    <div className="flex gap-3 mt-4">
      <button
        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 active:scale-95"
        onClick={onClear}
      >
        Clear
      </button>

      <button
        className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 active:scale-95"
        onClick={onUndo}
      >
        Undo
      </button>

      <button className={btn} onClick={onPredict}>
        Predict
      </button>
    </div>
  );
}
