export default function CanvasControls({ onClear, onUndo, onPredict }) {
  return (
    <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
      <button onClick={onClear}>Clear</button>
      <button onClick={onUndo}>Undo</button>
      <button onClick={onPredict}>Predict</button>
    </div>
  );
}
