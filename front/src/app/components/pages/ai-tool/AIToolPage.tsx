import { AxiosError } from "axios";
import { useEffect, useMemo, useState } from "react";
import Map from "../../../pages/Map";
import {
  usePredictHistoryItemQuery,
  usePredictHistoryQuery,
  usePredictImageMutation,
} from "../../../queries/predict.query";
import {
  AI_TOOL_FREE_TRIAL_LIMIT,
  dismissTrialWelcome,
  getAnonymousPredictCount,
  getIsLoggedIn,
  incrementAnonymousPredictCount,
  isTrialWelcomeDismissed,
} from "../../../utils/aiToolTrial";
import type { ScanStep } from "../../../utils/helper";
import { formatPredictionLabel } from "../../../utils/helper";
import { AIToolHero } from "./AIToolHero";
import { AIToolHistoryPreview } from "./AIToolHistoryPreview";
import { AIToolHistorySheet } from "./AIToolHistorySheet";
import { AIToolProcessingStep } from "./AIToolProcessingStep";
import { AIToolResultsStep } from "./AIToolResultsStep";
import { AIToolUploadStep } from "./AIToolUploadStep";

export default function AIToolPage() {
  const [currentStep, setCurrentStep] = useState<ScanStep>("upload");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(getIsLoggedIn);
  const [welcomeDismissed, setWelcomeDismissed] = useState(
    isTrialWelcomeDismissed,
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyPreviewId, setHistoryPreviewId] = useState<string | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);

  const predictMutation = usePredictImageMutation();
  const historyQuery = usePredictHistoryQuery(isLoggedIn && historyOpen);
  const historyItemQuery = usePredictHistoryItemQuery(
    historyPreviewId,
    isLoggedIn,
  );

  const anonymousUses = getAnonymousPredictCount();
  const trialsLeft = Math.max(0, AI_TOOL_FREE_TRIAL_LIMIT - anonymousUses);
  const trialExhausted =
    !isLoggedIn && anonymousUses >= AI_TOOL_FREE_TRIAL_LIMIT;
  const showTrialWelcome =
    !isLoggedIn &&
    !welcomeDismissed &&
    anonymousUses < AI_TOOL_FREE_TRIAL_LIMIT;

  useEffect(() => {
    const syncAuth = () => {
      setIsLoggedIn(getIsLoggedIn());
    };
    window.addEventListener("auth-changed", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("auth-changed", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  const analysisSummary = useMemo(() => {
    const data = predictMutation.data;
    if (!data) return null;
    const raw = data.confidence;
    const displayValue = raw <= 1 ? raw * 100 : raw;
    return {
      category: formatPredictionLabel(data.prediction),
      confidenceText: displayValue.toFixed(2),
      isLowConfidence: displayValue < 50,
      rawPrediction: data.prediction,
    };
  }, [predictMutation.data]);

  const handleDismissWelcome = () => {
    dismissTrialWelcome();
    setWelcomeDismissed(true);
  };

  const handleSelectHistoryItem = (id: string) => {
    setHistoryPreviewId(id);
    queueMicrotask(() => setHistoryOpen(false));
  };

  const clearHistoryPreview = () => {
    setHistoryPreviewId(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    clearHistoryPreview();

    if (
      !getIsLoggedIn() &&
      getAnonymousPredictCount() >= AI_TOOL_FREE_TRIAL_LIMIT
    ) {
      return;
    }

    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setCurrentStep("processing");

    predictMutation.mutate(file, {
      onSuccess: () => {
        if (!getIsLoggedIn()) {
          incrementAnonymousPredictCount();
        }
        setCurrentStep("results");
      },
      onError: (error) => {
        const message =
          (error as AxiosError<{ message?: string }>)?.response?.data
            ?.message ?? "Upload failed";
        setUploadError(message);
        setCurrentStep("upload");
        setUploadedImage(null);
      },
    });

    event.target.value = "";
  };

  const resetTool = () => {
    setCurrentStep("upload");
    setUploadedImage(null);
    setUploadError(null);
    setIsMapVisible(false);
    predictMutation.reset();
    clearHistoryPreview();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {isLoggedIn && (
        <AIToolHistorySheet
          historyOpen={historyOpen}
          onHistoryOpenChange={setHistoryOpen}
          historyQuery={historyQuery}
          onSelectHistoryItem={handleSelectHistoryItem}
        />
      )}

      <AIToolHero />

      <section className="py-12 px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          {historyPreviewId !== null && (
            <AIToolHistoryPreview
              onClose={clearHistoryPreview}
              query={historyItemQuery}
            />
          )}

          {historyPreviewId === null && (
            <>
              {currentStep === "upload" && (
                <AIToolUploadStep
                  showTrialWelcome={showTrialWelcome}
                  trialExhausted={trialExhausted}
                  trialsLeft={trialsLeft}
                  onDismissWelcome={handleDismissWelcome}
                  uploadError={uploadError}
                  isPending={predictMutation.isPending}
                  onFileChange={handleFileUpload}
                />
              )}

              {currentStep === "processing" && <AIToolProcessingStep />}

              {currentStep === "results" &&
                predictMutation.data &&
                analysisSummary && (
                  <div className="space-y-12">
                    <AIToolResultsStep
                      uploadedImage={uploadedImage}
                      analysisSummary={analysisSummary}
                      onReset={resetTool}
                      isMapVisible={isMapVisible}
                      onToggleMap={() => setIsMapVisible((prev) => !prev)}
                    />
                    {isMapVisible && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <h3 className="text-3xl font-bold mb-2">
                            Find a Dentist Near You
                          </h3>
                          <p className="text-gray-600">
                            Search for nearby clinics to schedule a consultation
                          </p>
                        </div>
                        <Map embedded />
                      </div>
                    )}
                  </div>
                )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
