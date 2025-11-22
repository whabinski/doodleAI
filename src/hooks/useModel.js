import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";

export const CLASS_NAMES = [
  "airplane", "bicycle", "cat", "fish", "house",
  "lightning", "star", "tree", "car",
];

export function useModel() {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const m = await tf.loadLayersModel("/tfjs_model/model.json");
        if (!cancelled) {
          setModel(m);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load model", err);
        if (!cancelled) {
          setError(err);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { model, loading, error };
}
