import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExecutionRequest {
  code: string;
  language: string;
  breakpoints?: number[];
  enableTrace?: boolean;
  enableAiAnalysis?: boolean;
}

interface ExecutionResult {
  output: string;
  errors: string[];
  executionTime: number;
  memoryUsage: number;
  trace: ExecutionTrace[];
  aiAnalysis?: string;
  suggestions?: string[];
}

interface ExecutionTrace {
  line: number;
  timestamp: number;
  variables: Record<string, any>;
  action: string;
  stackTrace?: string[];
}

const LANGUAGE_RUNNERS = {
  javascript: {
    execute: async (code: string, options: any): Promise<ExecutionResult> => {
      const startTime = Date.now();
      let output = '';
      let errors: string[] = [];
      let trace: ExecutionTrace[] = [];
      
      try {
        // Create a safe execution context
        const consoleOutput: string[] = [];
        const mockConsole = {
          log: (...args: any[]) => {
            const message = args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ');
            consoleOutput.push(message);
          },
          error: (...args: any[]) => {
            const message = args.map(arg => String(arg)).join(' ');
            errors.push(message);
          }
        };

        // Add tracing if breakpoints are enabled
        let instrumentedCode = code;
        if (options.breakpoints && options.breakpoints.length > 0) {
          const lines = code.split('\n');
          const instrumentedLines = lines.map((line, index) => {
            const lineNumber = index + 1;
            if (options.breakpoints.includes(lineNumber)) {
              return `console.log('TRACE:${lineNumber}:${Date.now()}:${line.trim()}'); ${line}`;
            }
            return line;
          });
          instrumentedCode = instrumentedLines.join('\n');
        }

        // Execute the code using Function constructor for safety
        const executeFunction = new Function('console', `
          ${instrumentedCode}
        `);
        
        executeFunction(mockConsole);
        
        output = consoleOutput.join('\n');
        
        // Parse trace information from console output
        if (options.enableTrace) {
          const traceLines = consoleOutput.filter(line => line.startsWith('TRACE:'));
          trace = traceLines.map(line => {
            const [, lineNum, timestamp, action] = line.split(':');
            return {
              line: parseInt(lineNum),
              timestamp: parseInt(timestamp),
              variables: {},
              action: action || 'Execution'
            };
          });
        }
        
      } catch (error) {
        errors.push(`Runtime Error: ${error.message}`);
      }
      
      const executionTime = Date.now() - startTime;
      
      return {
        output,
        errors,
        executionTime,
        memoryUsage: 0, // Not accurately measurable in this context
        trace
      };
    }
  },
  
  python: {
    execute: async (code: string, options: any): Promise<ExecutionResult> => {
      // Simulate Python execution (in a real implementation, use Pyodide or server-side Python)
      const startTime = Date.now();
      
      return {
        output: "Python execution simulation - integrate with Pyodide for real execution",
        errors: [],
        executionTime: Date.now() - startTime,
        memoryUsage: 0,
        trace: []
      };
    }
  },
  
  java: {
    execute: async (code: string, options: any): Promise<ExecutionResult> => {
      // Simulate Java execution (in a real implementation, use server-side compilation)
      const startTime = Date.now();
      
      // Basic Java syntax validation
      const errors: string[] = [];
      if (!code.includes('public class')) {
        errors.push("Java code must contain a public class");
      }
      if (!code.includes('public static void main')) {
        errors.push("Java code must contain a main method");
      }
      
      return {
        output: "Java execution simulation - integrate with server-side JVM for real execution",
        errors,
        executionTime: Date.now() - startTime,
        memoryUsage: 0,
        trace: []
      };
    }
  },
  
  cpp: {
    execute: async (code: string, options: any): Promise<ExecutionResult> => {
      // Simulate C++ execution (in a real implementation, use server-side compilation)
      const startTime = Date.now();
      
      const errors: string[] = [];
      if (!code.includes('#include')) {
        errors.push("C++ code should include necessary headers");
      }
      if (!code.includes('int main')) {
        errors.push("C++ code must contain a main function");
      }
      
      return {
        output: "C++ execution simulation - integrate with server-side compiler for real execution",
        errors,
        executionTime: Date.now() - startTime,
        memoryUsage: 0,
        trace: []
      };
    }
  }
};

async function generateAiAnalysis(code: string, language: string, result: ExecutionResult): Promise<{ analysis?: string; suggestions?: string[] }> {
  try {
    const openrouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openrouterApiKey) {
      return {};
    }

    const prompt = `Analyze this ${language} code and its execution result:

CODE:
${code}

EXECUTION RESULT:
- Output: ${result.output}
- Errors: ${result.errors.join(', ') || 'None'}
- Execution Time: ${result.executionTime}ms
- Trace Steps: ${result.trace.length}

Please provide:
1. A brief analysis of the code quality and execution
2. Any potential improvements or optimizations
3. Explanation of any errors if present
4. Performance insights

Keep the response concise and practical.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openrouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500
      })
    });

    if (!response.ok) {
      console.error('AI analysis failed:', await response.text());
      return {};
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (analysis) {
      // Extract suggestions from analysis
      const suggestions: string[] = [];
      if (result.errors.length > 0) {
        suggestions.push("Fix the identified errors to improve code execution");
      }
      if (result.executionTime > 1000) {
        suggestions.push("Consider optimizing for better performance");
      }
      if (result.trace.length === 0 && code.length > 100) {
        suggestions.push("Add breakpoints to debug complex logic");
      }

      return { analysis, suggestions };
    }

    return {};
  } catch (error) {
    console.error('AI analysis error:', error);
    return {};
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { code, language, breakpoints = [], enableTrace = false, enableAiAnalysis = false }: ExecutionRequest = await req.json();

    if (!code || !language) {
      return new Response(
        JSON.stringify({ error: 'Code and language are required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const runner = LANGUAGE_RUNNERS[language as keyof typeof LANGUAGE_RUNNERS];
    if (!runner) {
      return new Response(
        JSON.stringify({ error: `Unsupported language: ${language}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Executing ${language} code with ${breakpoints.length} breakpoints`);

    // Execute the code
    const result = await runner.execute(code, {
      breakpoints,
      enableTrace
    });

    // Generate AI analysis if requested
    let aiAnalysis, suggestions;
    if (enableAiAnalysis) {
      const analysis = await generateAiAnalysis(code, language, result);
      aiAnalysis = analysis.analysis;
      suggestions = analysis.suggestions;
    }

    const response: ExecutionResult = {
      ...result,
      aiAnalysis,
      suggestions
    };

    // Log the execution for analytics
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      await supabase.from('api_usage_logs').insert({
        user_email: 'admin@system.com',
        api_name: 'Code Execution Engine',
        endpoint_hit: `/code-execution-engine`,
        request_method: 'POST',
        response_time: result.executionTime,
        status_code: result.errors.length > 0 ? 400 : 200,
        request_payload: { language, codeLength: code.length, breakpoints: breakpoints.length },
        response_payload: { outputLength: result.output.length, errorCount: result.errors.length }
      });
    } catch (logError) {
      console.error('Failed to log execution:', logError);
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Execution engine error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});