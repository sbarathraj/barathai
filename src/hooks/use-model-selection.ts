import { useState, useEffect } from "react";

const MODEL_STORAGE_KEY = "barathAI-selected-model";
const DEFAULT_MODEL = "openai/gpt-oss-20b:free";

export const useModelSelection = () => {
  const [selectedModel, setSelectedModel] = useState<string>(() => {
    const saved = localStorage.getItem(MODEL_STORAGE_KEY);
    return saved || DEFAULT_MODEL;
  });

  useEffect(() => {
    localStorage.setItem(MODEL_STORAGE_KEY, selectedModel);
  }, [selectedModel]);

  return {
    selectedModel,
    setSelectedModel,
  };
};
