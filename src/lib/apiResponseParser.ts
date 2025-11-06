import type { OpenRouterResponse, Message, MessageReasoning } from '@/types/message';

export class ApiResponseParser {
  /**
   * Parse OpenRouter API response and extract reasoning data
   */
  static parseOpenRouterResponse(response: OpenRouterResponse): {
    content: string;
    reasoning?: MessageReasoning;
    model: string;
    usage?: any;
  } {
    const choice = response.choices?.[0];
    if (!choice?.message) {
      throw new Error('Invalid API response format');
    }

    const { content, reasoning, reasoning_details } = choice.message;
    
    // Extract reasoning data if available
    const reasoningData: MessageReasoning | undefined = 
      reasoning || reasoning_details ? {
        reasoning,
        reasoning_details
      } : undefined;

    return {
      content: content || '',
      reasoning: reasoningData,
      model: response.model,
      usage: response.usage
    };
  }

  /**
   * Format reasoning for storage in database
   */
  static formatReasoningForStorage(reasoning?: MessageReasoning): string | null {
    if (!reasoning) return null;
    
    try {
      return JSON.stringify(reasoning);
    } catch (error) {
      console.error('Failed to serialize reasoning data:', error);
      return null;
    }
  }

  /**
   * Parse reasoning from database storage
   */
  static parseReasoningFromStorage(reasoningJson?: string | null): MessageReasoning | undefined {
    if (!reasoningJson) return undefined;
    
    try {
      return JSON.parse(reasoningJson);
    } catch (error) {
      console.error('Failed to parse reasoning data:', error);
      return undefined;
    }
  }

  /**
   * Create a formatted message with reasoning
   */
  static createMessageWithReasoning(
    content: string,
    reasoning?: MessageReasoning,
    model?: string,
    usage?: any
  ): Partial<Message> {
    return {
      content,
      reasoning,
      model,
      usage,
      role: 'assistant',
      timestamp: new Date()
    };
  }

  /**
   * Extract reasoning summary for display
   */
  static getReasoningSummary(reasoning?: MessageReasoning): string | null {
    if (!reasoning) return null;
    
    if (reasoning.reasoning) {
      return reasoning.reasoning;
    }
    
    if (reasoning.reasoning_details && reasoning.reasoning_details.length > 0) {
      return reasoning.reasoning_details[0].text;
    }
    
    return null;
  }

  /**
   * Count reasoning steps
   */
  static getReasoningStepCount(reasoning?: MessageReasoning): number {
    if (!reasoning) return 0;
    
    let count = 0;
    if (reasoning.reasoning) count++;
    if (reasoning.reasoning_details) count += reasoning.reasoning_details.length;
    
    return count;
  }

  /**
   * Validate API response structure
   */
  static validateResponse(response: any): response is OpenRouterResponse {
    return (
      response &&
      typeof response === 'object' &&
      Array.isArray(response.choices) &&
      response.choices.length > 0 &&
      response.choices[0].message &&
      typeof response.choices[0].message.content === 'string'
    );
  }
}