export interface AIModel {
  id: string;
  name: string;
  provider: string;
  category: "reasoning" | "general" | "coding" | "vision" | "small";
  isFree: boolean;
  description?: string;
}

export const AI_MODELS: AIModel[] = [
  // Free Models Router (kept as requested)
  {
    id: "openrouter/free",
    name: "Free Models Router",
    provider: "OpenRouter",
    category: "general",
    isFree: true,
    description: "Auto-routes to free models",
  },

  // NVIDIA Models
  {
    id: "nvidia/nemotron-nano-12b-v2-vl:free",
    name: "Nemotron Nano 12B 2 VL",
    provider: "NVIDIA",
    category: "vision",
    isFree: true,
    description: "Vision-language model",
  },
  {
    id: "nvidia/nemotron-3.5-content-safety:free",
    name: "Nemotron 3.5 Content Safety",
    provider: "NVIDIA",
    category: "small",
    isFree: true,
    description: "Content safety classifier",
  },
  {
    id: "nvidia/nemotron-3-ultra-550b-a55b:free",
    name: "Nemotron 3 Ultra",
    provider: "NVIDIA",
    category: "general",
    isFree: true,
    description: "Ultra large NVIDIA model",
  },
  {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    name: "Nemotron 3 Super",
    provider: "NVIDIA",
    category: "general",
    isFree: true,
    description: "Super large NVIDIA model",
  },
  {
    id: "nvidia/nemotron-3-nano-30b-a3b:free",
    name: "Nemotron 3 Nano 30B A3B",
    provider: "NVIDIA",
    category: "small",
    isFree: true,
    description: "Nvidia Nemotron nano model",
  },
  {
    id: "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    name: "Nemotron 3 Nano Omni",
    provider: "NVIDIA",
    category: "reasoning",
    isFree: true,
    description: "Nano omni reasoning model",
  },
  {
    id: "nvidia/nemotron-nano-9b-v2:free",
    name: "Nemotron Nano 9B V2",
    provider: "NVIDIA",
    category: "small",
    isFree: true,
    description: "Nano model v2",
  },

  // Google Models
  {
    id: "google/gemma-4-26b-a4b-it:free",
    name: "Gemma 4 26B A4B",
    provider: "Google",
    category: "general",
    isFree: true,
    description: "Gemma 4 mid-size model",
  },
  {
    id: "google/gemma-4-31b-it:free",
    name: "Gemma 4 31B",
    provider: "Google",
    category: "general",
    isFree: true,
    description: "Gemma 4 large model",
  },

  // LiquidAI Models
  {
    id: "liquid/lfm-2.5-1.2b-thinking:free",
    name: "LFM2.5-1.2B-Thinking",
    provider: "LiquidAI",
    category: "reasoning",
    isFree: true,
    description: "Lightweight thinking model",
  },
  {
    id: "liquid/lfm-2.5-1.2b-instruct:free",
    name: "LFM2.5-1.2B-Instruct",
    provider: "LiquidAI",
    category: "small",
    isFree: true,
    description: "Lightweight instruction model",
  },

  // Qwen Models
  {
    id: "qwen/qwen3-next-80b-a3b-instruct:free",
    name: "Qwen3 Next 80B A3B Instruct",
    provider: "Qwen",
    category: "general",
    isFree: true,
    description: "Next-gen Qwen 80B model",
  },
  {
    id: "qwen/qwen3-coder:free",
    name: "Qwen3 Coder 480B A35B",
    provider: "Qwen",
    category: "coding",
    isFree: true,
    description: "Large coding model",
  },

  // Meta Models
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B Instruct",
    provider: "Meta",
    category: "general",
    isFree: true,
    description: "Meta's flagship model",
  },
  {
    id: "meta-llama/llama-3.2-3b-instruct:free",
    name: "Llama 3.2 3B Instruct",
    provider: "Meta",
    category: "small",
    isFree: true,
    description: "Compact Llama model",
  },

  // Nous Models
  {
    id: "nousresearch/hermes-3-llama-3.1-405b:free",
    name: "Hermes 3 405B Instruct",
    provider: "Nous",
    category: "general",
    isFree: true,
    description: "Large instruction model",
  },

  // Venice Models
  {
    id: "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
    name: "Venice Uncensored",
    provider: "Venice",
    category: "general",
    isFree: true,
    description: "Uncensored model",
  },

  // OpenAI Models
  {
    id: "openai/gpt-oss-120b:free",
    name: "GPT OSS 120B",
    provider: "OpenAI",
    category: "general",
    isFree: true,
    description: "Large open-source GPT model",
  },
  {
    id: "openai/gpt-oss-20b:free",
    name: "GPT OSS 20B",
    provider: "OpenAI",
    category: "general",
    isFree: true,
    description: "Open-source GPT variant",
  },

  // Poolside Models
  {
    id: "poolside/laguna-m.1:free",
    name: "Laguna M.1",
    provider: "Poolside",
    category: "coding",
    isFree: true,
    description: "Poolside coding model",
  },
  {
    id: "poolside/laguna-xs.2:free",
    name: "Laguna XS.2",
    provider: "Poolside",
    category: "coding",
    isFree: true,
    description: "Poolside compact coding model",
  },

  // Cohere Models
  {
    id: "cohere/north-mini-code:free",
    name: "North Mini Code",
    provider: "Cohere",
    category: "coding",
    isFree: true,
    description: "Compact code generation model",
  },
];

export const MODEL_CATEGORIES = [
  { id: "all", label: "All Models", icon: "🤖" },
  { id: "reasoning", label: "Reasoning", icon: "🧠" },
  { id: "general", label: "General", icon: "💬" },
  { id: "coding", label: "Coding", icon: "💻" },
  { id: "vision", label: "Vision", icon: "👁️" },
  { id: "small", label: "Fast", icon: "⚡" },
] as const;

export const MODEL_PROVIDERS = [
  "All",
  "OpenRouter",
  "NVIDIA",
  "Google",
  "LiquidAI",
  "Qwen",
  "Meta",
  "Nous",
  "Venice",
  "OpenAI",
  "Poolside",
  "Cohere",
] as const;
