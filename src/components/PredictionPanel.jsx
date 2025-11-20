export default function PredictionPanel({ prediction }) {
  if (!prediction) {
    return <p>No prediction yet.</p>;
  }

  return (
    <div style={{ marginTop: "1rem" }}>
      <h2>AI Guess:</h2>
      <p>
        <strong>{prediction.label}</strong> ({prediction.confidence}%)
      </p>
    </div>
  );
}
