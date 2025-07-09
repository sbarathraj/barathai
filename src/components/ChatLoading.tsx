
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

export const ChatLoading: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading BarathAI...</p>
          <p className="text-slate-400 text-sm mt-2">Please wait while we set up your experience</p>
        </CardContent>
      </Card>
    </div>
  );
};
