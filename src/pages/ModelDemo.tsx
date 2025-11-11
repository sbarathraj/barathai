import React from "react";
import { ModelSelectorDemo } from "@/components/ModelSelectorDemo";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

/**
 * Demo page for the Model Selector
 * Route: /model-demo
 */
export const ModelDemo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <ModelSelectorDemo />
      </div>
    </div>
  );
};

export default ModelDemo;
