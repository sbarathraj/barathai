interface APIConfig {
  url: string;
  key: string;
  model: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface APIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class APIService {
  private primaryConfig: APIConfig;
  private fallbackConfig: APIConfig;
  private maxRetries = 3;
  private retryDelay = 1000;

  constructor() {
    this.primaryConfig = {
      url: "https://openrouter.ai/api/v1/chat/completions",
      key: import.meta.env.VITE_OPENROUTER_API_KEY || '',
      model: "deepseek/deepseek-chat-v3-0324:free"
    };

    this.fallbackConfig = {
      url: import.meta.env.VITE_OPENROUTER_API_URL2 || this.primaryConfig.url,
      key: import.meta.env.VITE_OPENROUTER_API_KEY2 || '',
      model: "deepseek/deepseek-chat-v3-0324:free"
    };
  }

  private async makeRequest(config: APIConfig, messages: ChatMessage[]): Promise<APIResponse> {
    const requestBody = {
      model: config.model,
      messages: messages,
      max_tokens: 2000,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
      stream: false
    };

    console.log('🚀 Making API request:', {
      url: config.url,
      model: config.model,
      messageCount: messages.length,
      hasApiKey: !!config.key
    });

    const response = await fetch(config.url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "BarathAI Chat"
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 API Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ API Response received:', {
      hasChoices: !!data.choices,
      choicesLength: data.choices?.length,
      hasMessage: !!data.choices?.[0]?.message
    });

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('❌ Invalid API response format:', data);
      throw new Error('Invalid response format from API');
    }

    return data;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sendMessage(messages: ChatMessage[]): Promise<string> {
    // Validate inputs
    if (!messages || messages.length === 0) {
      throw new Error('No messages provided');
    }

    if (!this.primaryConfig.key && !this.fallbackConfig.key) {
      throw new Error('No API keys configured. Please check your environment variables.');
    }

    // Prepare messages with system prompt
    const systemMessage: ChatMessage = {
      role: "system",
      content: "You are BarathAI, an intelligent AI assistant created by Barathraj. You are knowledgeable, friendly, and always strive to provide accurate and helpful information. You communicate in a natural, conversational manner. You can help with coding, problem-solving, research, creative writing, and general questions. Always be helpful, accurate, and engaging in your responses. Format your responses using proper Markdown syntax for better readability."
    };

    const apiMessages = [systemMessage, ...messages.slice(-10)]; // Keep last 10 messages for context

    let lastError: Error | null = null;

    // Try primary API first
    if (this.primaryConfig.key) {
      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        try {
          const response = await this.makeRequest(this.primaryConfig, apiMessages);
          return response.choices[0].message.content;
        } catch (error) {
          lastError = error as Error;
          console.warn(`Primary API attempt ${attempt + 1} failed:`, error);
          
          if (attempt < this.maxRetries - 1) {
            await this.sleep(this.retryDelay * (attempt + 1));
          }
        }
      }
    }

    // Try fallback API if primary fails
    if (this.fallbackConfig.key && this.fallbackConfig.key !== this.primaryConfig.key) {
      console.log('🔄 Trying fallback API...');
      
      for (let attempt = 0; attempt < this.maxRetries; attempt++) {
        try {
          const response = await this.makeRequest(this.fallbackConfig, apiMessages);
          return response.choices[0].message.content;
        } catch (error) {
          lastError = error as Error;
          console.warn(`Fallback API attempt ${attempt + 1} failed:`, error);
          
          if (attempt < this.maxRetries - 1) {
            await this.sleep(this.retryDelay * (attempt + 1));
          }
        }
      }
    }

    // If all attempts failed, throw the last error
    throw lastError || new Error('All API attempts failed');
  }

  // Health check method
  async checkHealth(): Promise<boolean> {
    try {
      const testMessages: ChatMessage[] = [
        { role: 'user', content: 'Hello' }
      ];
      
      await this.sendMessage(testMessages);
      return true;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  }

  // Get API status
  getStatus(): { primary: boolean; fallback: boolean } {
    return {
      primary: !!this.primaryConfig.key,
      fallback: !!this.fallbackConfig.key && this.fallbackConfig.key !== this.primaryConfig.key
    };
  }
}

export const apiService = new APIService();
export type { ChatMessage };