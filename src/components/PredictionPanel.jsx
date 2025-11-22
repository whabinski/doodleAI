export default function PredictionPanel({ prediction }) {
  return (
    <div className="bg-gray-100 p-5 rounded-xl shadow-inner min-h-[150px]">
      <h2 className="text-xl font-semibold text-gray-800 mb-3">Prediction</h2>

      {!prediction ? (
        <p className="text-gray-500">Draw something and press Predict!</p>
      ) : (
        <div>
          <p className="text-lg">
            <span className="font-bold text-blue-600">
              {prediction.label}
            </span>
          </p>
          <p className="text-gray-700">
            Confidence: {prediction.confidence}%
          </p>
        </div>
      )}
    </div>
  );
}
