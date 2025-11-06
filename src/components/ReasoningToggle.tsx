import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Brain, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReasoningToggleProps {
  onToggle?: (enabled: boolean) => void;
  className?: string;
}

export const ReasoningToggle: React.FC<ReasoningToggleProps> = ({
  onToggle,
  className = ""
}) => {
  const [reasoningEnabled, setReasoningEnabled] = useState(() => {
    const saved = localStorage.getItem('barathAI-reasoning-enabled');
    return saved ? JSON.parse(saved) : true; // Default to enabled
  });
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('barathAI-reasoning-enabled', JSON.stringify(reasoningEnabled));
    onToggle?.(reasoningEnabled);
  }, [reasoningEnabled, onToggle]);

  const handleToggle = (enabled: boolean) => {
    setReasoningEnabled(enabled);
    
    toast({
      title: enabled ? "Reasoning Display Enabled" : "Reasoning Display Disabled",
      description: enabled 
        ? "AI reasoning will be shown for supported models" 
        : "AI reasoning will be hidden from responses",
    });
  };

  return (
    <Card className={`bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-white/30 dark:border-slate-800/40 shadow-xl ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          AI Reasoning Display
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <Label htmlFor="reasoning-toggle" className="text-sm font-medium text-slate-800 dark:text-slate-100">
              Show AI Reasoning Process
            </Label>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Display how the AI analyzed and processed your requests
            </p>
          </div>
          <Switch
            id="reasoning-toggle"
            checked={reasoningEnabled}
            onCheckedChange={handleToggle}
            className="data-[state=checked]:bg-blue-500"
          />
        </div>

        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/50">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">About AI Reasoning:</p>
              <ul className="space-y-1 text-blue-600 dark:text-blue-400">
                <li>• Shows the AI's thought process step-by-step</li>
                <li>• Available for supported models (GPT-4, Claude, etc.)</li>
                <li>• Helps understand how responses are generated</li>
                <li>• Can be collapsed/expanded for better readability</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Reasoning data is automatically extracted from API responses
        </div>
      </CardContent>
    </Card>
  );
};