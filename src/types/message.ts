// Enhanced message types with reasoning support
export interface ReasoningDetail {
  text: string;
  type: string;
  index: number;
  format?: string;
}

export interface MessageReasoning {
  reasoning?: string;
  reasoning_details?: ReasoningDetail[];
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  image?: string;
  reasoning?: MessageReasoning;
  model?: string;
  usage?: {
    total_tokens?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}

export interface OpenRouterResponse {
  id: string;
  model: string;
  usage?: {
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
    prompt_tokens_details?: {
      cached_tokens: number;
    };
  };
  object: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
      refusal?: string | null;
      reasoning?: string;
      reasoning_details?: ReasoningDetail[];
    };
    logprobs?: any;
    finish_reason: string;
    native_finish_reason?: string;
  }>;
  created: number;
  provider?: string;
}