import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Bug, 
  FileCode, 
  Terminal, 
  Eye,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Cpu,
  MemoryStick
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

interface DebugSession {
  id: string;
  code: string;
  language: string;
  output: string;
  errors: string[];
  executionTime: number;
  memoryUsage: number;
  status: 'idle' | 'running' | 'completed' | 'error';
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

interface LanguageConfig {
  name: string;
  extension: string;
  template: string;
  runner: string;
  features: string[];
}

const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  javascript: {
    name: 'JavaScript',
    extension: 'js',
    template: `// JavaScript Example
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log("Fibonacci sequence:");
for (let i = 0; i < 10; i++) {
  console.log(\`F(\${i}) = \${fibonacci(i)}\`);
}`,
    runner: 'node',
    features: ['debugging', 'real-time', 'ai-analysis']
  },
  python: {
    name: 'Python',
    extension: 'py',
    template: `# Python Example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print("Fibonacci sequence:")
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")`,
    runner: 'python',
    features: ['debugging', 'real-time', 'ai-analysis']
  },
  java: {
    name: 'Java',
    extension: 'java',
    template: `// Java Example
public class Main {
    public static void main(String[] args) {
        System.out.println("Fibonacci sequence:");
        for (int i = 0; i < 10; i++) {
            System.out.println("F(" + i + ") = " + fibonacci(i));
        }
    }
    
    public static int fibonacci(int n) {
        if (n <= 1) return n;
        return fibonacci(n - 1) + fibonacci(n - 2);
    }
}`,
    runner: 'java',
    features: ['debugging', 'compilation', 'ai-analysis']
  },
  cpp: {
    name: 'C++',
    extension: 'cpp',
    template: `// C++ Example
#include <iostream>
using namespace std;

int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

int main() {
    cout << "Fibonacci sequence:" << endl;
    for (int i = 0; i < 10; i++) {
        cout << "F(" << i << ") = " << fibonacci(i) << endl;
    }
    return 0;
}`,
    runner: 'g++',
    features: ['debugging', 'compilation', 'memory-analysis']
  }
};

export const MultiLanguageDebugger: React.FC = () => {
  const { theme } = useTheme();
  const { toast } = useToast();
  const [currentLanguage, setCurrentLanguage] = useState('javascript');
  const [code, setCode] = useState(SUPPORTED_LANGUAGES.javascript.template);
  const [session, setSession] = useState<DebugSession | null>(null);
  const [activeTab, setActiveTab] = useState('editor');
  const [breakpoints, setBreakpoints] = useState<Set<number>>(new Set());
  const [executing, setExecuting] = useState(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    setCode(SUPPORTED_LANGUAGES[currentLanguage].template);
  }, [currentLanguage]);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Add breakpoint functionality
    editor.onMouseDown((e: any) => {
      if (e.target.type === 1) { // GUTTER
        const lineNumber = e.target.position.lineNumber;
        toggleBreakpoint(lineNumber);
      }
    });
  };

  const toggleBreakpoint = (lineNumber: number) => {
    const newBreakpoints = new Set(breakpoints);
    if (newBreakpoints.has(lineNumber)) {
      newBreakpoints.delete(lineNumber);
    } else {
      newBreakpoints.add(lineNumber);
    }
    setBreakpoints(newBreakpoints);
    
    // Update editor decorations
    if (editorRef.current) {
      const decorations = Array.from(newBreakpoints).map(line => ({
        range: { startLineNumber: line, startColumn: 1, endLineNumber: line, endColumn: 1 },
        options: {
          isWholeLine: true,
          className: 'bg-red-500/20 border-l-4 border-red-500',
          glyphMarginClassName: 'bg-red-500 rounded-full w-3 h-3'
        }
      }));
      editorRef.current.deltaDecorations([], decorations);
    }
  };

  const executeCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No Code",
        description: "Please enter some code to execute",
        variant: "destructive"
      });
      return;
    }

    setExecuting(true);
    setActiveTab('output');
    
    const sessionId = `debug_${Date.now()}`;
    const newSession: DebugSession = {
      id: sessionId,
      code,
      language: currentLanguage,
      output: '',
      errors: [],
      executionTime: 0,
      memoryUsage: 0,
      status: 'running',
      trace: []
    };
    
    setSession(newSession);

    try {
      const { data, error } = await supabase.functions.invoke('code-execution-engine', {
        body: {
          code,
          language: currentLanguage,
          breakpoints: Array.from(breakpoints),
          enableTrace: true,
          enableAiAnalysis: true
        }
      });

      if (error) throw error;

      const completedSession: DebugSession = {
        ...newSession,
        output: data.output || '',
        errors: data.errors || [],
        executionTime: data.executionTime || 0,
        memoryUsage: data.memoryUsage || 0,
        status: data.errors?.length > 0 ? 'error' : 'completed',
        trace: data.trace || [],
        aiAnalysis: data.aiAnalysis,
        suggestions: data.suggestions
      };

      setSession(completedSession);

      if (completedSession.status === 'error') {
        toast({
          title: "Execution Failed",
          description: `Code execution failed with ${completedSession.errors.length} error(s)`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Execution Completed",
          description: `Code executed successfully in ${completedSession.executionTime}ms`,
        });
      }

    } catch (err) {
      console.error('Execution error:', err);
      setSession({
        ...newSession,
        status: 'error',
        errors: ['Failed to execute code: ' + (err as Error).message]
      });
      
      toast({
        title: "Execution Error",
        description: "Failed to execute code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setExecuting(false);
    }
  };

  const stopExecution = () => {
    setExecuting(false);
    if (session) {
      setSession({
        ...session,
        status: 'idle'
      });
    }
  };

  const resetSession = () => {
    setSession(null);
    setBreakpoints(new Set());
    setActiveTab('editor');
    
    // Clear editor decorations
    if (editorRef.current) {
      editorRef.current.deltaDecorations([], []);
    }
  };

  const formatExecutionTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const formatMemoryUsage = (bytes: number) => {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Multi-Language Debugger</h2>
          <p className="text-muted-foreground">
            Professional debugging environment with AI-powered analysis
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={currentLanguage} onValueChange={setCurrentLanguage}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SUPPORTED_LANGUAGES).map(([key, lang]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center space-x-2">
                    <FileCode className="h-4 w-4" />
                    <span>{lang.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={executeCode}
              disabled={executing}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-2" />
              {executing ? 'Running...' : 'Execute'}
            </Button>
            
            {executing && (
              <Button
                onClick={stopExecution}
                variant="destructive"
              >
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
            
            <Button
              onClick={resetSession}
              variant="outline"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      {session && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Badge variant={
                  session.status === 'completed' ? 'default' :
                  session.status === 'error' ? 'destructive' :
                  session.status === 'running' ? 'secondary' : 'outline'
                }>
                  {session.status === 'completed' && <CheckCircle className="h-4 w-4 mr-1" />}
                  {session.status === 'error' && <XCircle className="h-4 w-4 mr-1" />}
                  {session.status === 'running' && <Clock className="h-4 w-4 mr-1 animate-spin" />}
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </Badge>
                
                {session.executionTime > 0 && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatExecutionTime(session.executionTime)}</span>
                  </div>
                )}
                
                {session.memoryUsage > 0 && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <MemoryStick className="h-4 w-4" />
                    <span>{formatMemoryUsage(session.memoryUsage)}</span>
                  </div>
                )}
                
                {breakpoints.size > 0 && (
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Bug className="h-4 w-4" />
                    <span>{breakpoints.size} breakpoint(s)</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                {SUPPORTED_LANGUAGES[currentLanguage].features.map(feature => (
                  <Badge key={feature} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Editor Panel */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileCode className="h-5 w-5" />
                <span>Code Editor</span>
                <Badge variant="outline">{SUPPORTED_LANGUAGES[currentLanguage].name}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(600px-80px)]">
              <Editor
                height="100%"
                language={currentLanguage}
                value={code}
                onChange={(value) => setCode(value || '')}
                onMount={handleEditorDidMount}
                theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
                options={{
                  fontSize: 14,
                  lineNumbers: 'on',
                  glyphMargin: true,
                  folding: true,
                  lineDecorationsWidth: 10,
                  lineNumbersMinChars: 3,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  insertSpaces: true,
                  wordWrap: 'on',
                  minimap: { enabled: true },
                  bracketPairColorization: { enabled: true },
                  renderLineHighlight: 'all',
                  smoothScrolling: true
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Debug Panel */}
        <div>
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bug className="h-5 w-5" />
                <span>Debug Panel</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 h-[calc(600px-80px)]">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="editor" className="text-xs">
                    <FileCode className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="output" className="text-xs">
                    <Terminal className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="trace" className="text-xs">
                    <Eye className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="ai" className="text-xs">
                    <Zap className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="editor" className="h-[calc(100%-40px)] p-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Breakpoints</h4>
                      {breakpoints.size === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Click on line numbers to add breakpoints
                        </p>
                      ) : (
                        <div className="space-y-1">
                          {Array.from(breakpoints).map(line => (
                            <Badge key={line} variant="outline" className="mr-1">
                              Line {line}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium mb-2">Language Features</h4>
                      <div className="space-y-1">
                        {SUPPORTED_LANGUAGES[currentLanguage].features.map(feature => (
                          <Badge key={feature} variant="secondary" className="mr-1 text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="output" className="h-[calc(100%-40px)] p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      {session?.output && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center space-x-2">
                            <Terminal className="h-4 w-4" />
                            <span>Output</span>
                          </h4>
                          <pre className="bg-muted p-3 rounded text-sm font-mono whitespace-pre-wrap">
                            {session.output}
                          </pre>
                        </div>
                      )}
                      
                      {session?.errors && session.errors.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center space-x-2 text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <span>Errors</span>
                          </h4>
                          <div className="space-y-2">
                            {session.errors.map((error, index) => (
                              <Alert key={index} variant="destructive">
                                <AlertDescription className="font-mono text-sm">
                                  {error}
                                </AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {!session && (
                        <div className="text-center text-muted-foreground py-8">
                          <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Execute code to see output here</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="trace" className="h-[calc(100%-40px)] p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      {session?.trace && session.trace.length > 0 ? (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center space-x-2">
                            <Eye className="h-4 w-4" />
                            <span>Execution Trace</span>
                          </h4>
                          <div className="space-y-2">
                            {session.trace.map((step, index) => (
                              <Card key={index} className="p-3">
                                <div className="flex justify-between items-center mb-2">
                                  <Badge variant="outline">Line {step.line}</Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(step.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-sm font-mono mb-2">{step.action}</p>
                                {Object.keys(step.variables).length > 0 && (
                                  <div className="text-xs">
                                    <strong>Variables:</strong>
                                    <pre className="mt-1 bg-muted p-2 rounded">
                                      {JSON.stringify(step.variables, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </Card>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Execute code with breakpoints to see trace</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="ai" className="h-[calc(100%-40px)] p-4">
                  <ScrollArea className="h-full">
                    <div className="space-y-4">
                      {session?.aiAnalysis ? (
                        <div>
                          <h4 className="font-medium mb-2 flex items-center space-x-2">
                            <Zap className="h-4 w-4" />
                            <span>AI Analysis</span>
                          </h4>
                          <Card className="p-3">
                            <p className="text-sm whitespace-pre-wrap">{session.aiAnalysis}</p>
                          </Card>
                        </div>
                      ) : null}
                      
                      {session?.suggestions && session.suggestions.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Suggestions</h4>
                          <div className="space-y-2">
                            {session.suggestions.map((suggestion, index) => (
                              <Alert key={index}>
                                <AlertDescription>{suggestion}</AlertDescription>
                              </Alert>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {!session?.aiAnalysis && (
                        <div className="text-center text-muted-foreground py-8">
                          <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Execute code to get AI-powered analysis</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};