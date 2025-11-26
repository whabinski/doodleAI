// src/hooks/useModel.js
import { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";

export const CLASS_NAMES = [
  "airplane",
  "apple",
  "bicycle",
  "book",
  "car",
  "cat",
  "crown",
  "eiffel Tower",
  "fish",
  "helicopter",
  "house",
  "moustache",
  "star",
  "sword",
  "spider",
];

export function useModel() {
  const [model, setModel] = useState(null);
  // "loading" | "ready" | "error"
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setStatus("loading");

        // Works in dev (/) and on GitHub Pages (/doodleai/)
        const base = import.meta.env.BASE_URL || "/";
        const modelUrl = `${base}tfjs_model/model.json`;

        console.log("Loading TFJS model from:", modelUrl);
        const m = await tf.loadLayersModel(modelUrl);

        if (!cancelled) {
          setModel(m);
          setStatus("ready");
          setError(null);
        }
      } catch (err) {
        console.error("Failed to load TFJS model", err);
        if (!cancelled) {
          setError(err);
          setStatus("error");
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { model, status, error };
}
