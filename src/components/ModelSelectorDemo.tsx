import React from "react";
import { ModelSelector } from "./ModelSelector";
import { useModelSelection } from "@/hooks/use-model-selection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AI_MODELS } from "@/types/models";
import { Brain, Zap, Code, Eye, MessageSquare } from "lucide-react";

/**
 * Demo component to showcase the ModelSelector
 * Can be used in a demo page or for testing
 */
export const ModelSelectorDemo: React.FC = () => {
  const { selectedModel, setSelectedModel } = useModelSelection();

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "reasoning":
        return <Brain className="h-5 w-5" />;
      case "coding":
        return <Code className="h-5 w-5" />;
      case "vision":
        return <Eye className="h-5 w-5" />;
      case "small":
        return <Zap className="h-5 w-5" />;
      default:
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          AI Model Selector
        </h1>
        <p className="text-muted-foreground">
          Choose from 50+ free AI models across different categories
        </p>
      </div>

      <div className="flex justify-center">
        <ModelSelector
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
        />
      </div>

      {currentModel && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(currentModel.category)}
                {currentModel.name}
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                Free
              </Badge>
            </div>
            <CardDescription>
              {currentModel.provider} • {currentModel.category}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Model Details</h3>
                <dl className="grid grid-cols-2 gap-2 text-sm">
                  <dt className="text-muted-foreground">Model ID:</dt>
                  <dd className="font-mono text-xs">{currentModel.id}</dd>

                  <dt className="text-muted-foreground">Provider:</dt>
                  <dd>{currentModel.provider}</dd>

                  <dt className="text-muted-foreground">Category:</dt>
                  <dd className="capitalize">{currentModel.category}</dd>

                  <dt className="text-muted-foreground">Status:</dt>
                  <dd className="text-green-600">Available</dd>
                </dl>
              </div>

              {currentModel.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground">
                    {currentModel.description}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">Best For</h3>
                <div className="flex flex-wrap gap-2">
                  {currentModel.category === "reasoning" && (
                    <>
                      <Badge variant="outline">Problem Solving</Badge>
                      <Badge variant="outline">Logical Reasoning</Badge>
                      <Badge variant="outline">Step-by-step Thinking</Badge>
                    </>
                  )}
                  {currentModel.category === "general" && (
                    <>
                      <Badge variant="outline">Conversation</Badge>
                      <Badge variant="outline">Q&A</Badge>
                      <Badge variant="outline">Creative Writing</Badge>
                    </>
                  )}
                  {currentModel.category === "coding" && (
                    <>
                      <Badge variant="outline">Code Generation</Badge>
                      <Badge variant="outline">Debugging</Badge>
                      <Badge variant="outline">Documentation</Badge>
                    </>
                  )}
                  {currentModel.category === "vision" && (
                    <>
                      <Badge variant="outline">Image Understanding</Badge>
                      <Badge variant="outline">Visual Q&A</Badge>
                      <Badge variant="outline">OCR</Badge>
                    </>
                  )}
                  {currentModel.category === "small" && (
                    <>
                      <Badge variant="outline">Quick Responses</Badge>
                      <Badge variant="outline">Low Latency</Badge>
                      <Badge variant="outline">Efficient</Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-4">Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Models
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{AI_MODELS.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Reasoning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {AI_MODELS.filter((m) => m.category === "reasoning").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                General
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {AI_MODELS.filter((m) => m.category === "general").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Coding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {AI_MODELS.filter((m) => m.category === "coding").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Fast
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {AI_MODELS.filter((m) => m.category === "small").length}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
