import { Loader2 } from "lucide-react";
import { Card } from "../../Card";

export function AIToolProcessingStep() {
  return (
    <Card variant="glass" className="text-center">
      <div className="max-w-2xl mx-auto py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-[#3FA9F5] to-[#1F6FEB] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
        </div>
        <h2 className="text-3xl font-bold mb-4">AI Scanning in Progress...</h2>
        <p className="text-gray-600 mb-8">
          Our advanced AI is analyzing your dental photo
        </p>

        <div className="space-y-3 text-left max-w-md mx-auto">
          <div className="flex items-center gap-3 text-gray-700">
            <Loader2 className="w-5 h-5 text-[#3FA9F5] animate-spin" />
            <span>Running prediction model...</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
