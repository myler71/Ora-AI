import { FileCheck, LogIn } from "lucide-react";
import { Button } from "../../Button";
import { Card } from "../../Card";
import { AI_TOOL_FREE_TRIAL_LIMIT, openAuthDialog } from "../../../utils/aiToolTrial";

type Props = {
  showTrialWelcome: boolean;
  trialExhausted: boolean;
  trialsLeft: number;
  onDismissWelcome: () => void;
};

export function AIToolTrialBanners({
  showTrialWelcome,
  trialExhausted,
  trialsLeft,
  onDismissWelcome,
}: Props) {
  return (
    <>
      {showTrialWelcome && (
        <Card
          variant="glass"
          className="p-4 mb-8 text-left w-full max-w-2xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                <FileCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {AI_TOOL_FREE_TRIAL_LIMIT} free AI scans
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  You can try this tool {AI_TOOL_FREE_TRIAL_LIMIT} times without
                  signing in ({trialsLeft} left). Sign in to keep scanning without
                  limits and to see your previous predictions.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 self-start sm:self-center"
              onClick={onDismissWelcome}
            >
              Got it
            </Button>
          </div>
        </Card>
      )}

      {trialExhausted && (
        <Card
          variant="glass"
          className="p-4 mb-8 text-left w-full max-w-2xl mx-auto"
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
                <LogIn className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Sign in to use the AI scan
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  You&apos;ve used all {AI_TOOL_FREE_TRIAL_LIMIT} free tries.
                  Please log in to continue using this feature.
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              className="shrink-0 self-start"
              onClick={() => openAuthDialog("login")}
            >
              Log in
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
