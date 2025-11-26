// src/hooks/useModel.js

// React hooks for local component state + side effects
import { useEffect, useState } from "react";
// TensorFlow.js library
import * as tf from "@tensorflow/tfjs";

// Master list of all classes the model predicts.
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

// Subset of classes that are actually used as prompts in the game UI.
export const PROMPT_NAMES = CLASS_NAMES.filter((name) => name !== "spider");

/**
 * useModel
 * --------
 * Custom hook that:
 *  - Loads the TFJS model once on mount.
 *  - Exposes the model instance and a status string and any error.
 *
 * Returns:
 *  {
 *    model:  tf.LayersModel | null,
 *    status: "loading" | "ready" | "error",
 *    error:  Error | null
 *  }
 */
export function useModel() {
  // The loaded TFJS model instance (null until ready)
  const [model, setModel] = useState(null);

  // Loading state: "loading" while fetching, "ready" when loaded, "error" if something fails
  const [status, setStatus] = useState("loading");

  // Any error caught while loading the model
  const [error, setError] = useState(null);

  useEffect(() => {
    // Safety flag so we don't call setState on an unmounted component
    let cancelled = false;

    /**
     * load
     * ----
     * Async function that:
     *  - Builds a model URL that works for both dev and GitHub Pages.
     *  - Calls tf.loadLayersModel.
     *  - Updates model / status / error if the hook is still mounted.
     */
    async function load() {
      try {
        // Enter "loading" state while we fetch the model
        setStatus("loading");

        // Works in dev (BASE_URL = "/") and on GitHub Pages (BASE_URL = "/doodleai/")
        const base = import.meta.env.BASE_URL || "/";
        const modelUrl = `${base}tfjs_model/model.json`;

        console.log("Loading TFJS model from:", modelUrl);

        // Load a Keras-style LayersModel from the public folder
        const m = await tf.loadLayersModel(modelUrl);

        // If the component using this hook is still mounted, commit the result
        if (!cancelled) {
          setModel(m);
          setStatus("ready");
          setError(null);
        }
      } catch (err) {
        console.error("Failed to load TFJS model", err);
        if (!cancelled) {
          // Record the error and mark status as "error"
          setError(err);
          setStatus("error");
        }
      }
    }

    // Trigger the async load once on mount
    load();

    // Cleanup: if the component unmounts while loading,
    // flip `cancelled` so we don't update state afterward.
    return () => {
      cancelled = true;
    };
  }, []);

  return { model, status, error };
}
