import type { UseQueryResult } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle, Loader2, X } from "lucide-react";
import { Button } from "../../Button";
import { Card } from "../../Card";
import type { PredictHistoryDetail } from "../../../services/predict.service";
import { resolveApiMediaUrl } from "../../../services/axiosInstance";
import { formatPredictionLabel } from "../../../utils/helper";

function detailToSummary(detail: PredictHistoryDetail) {
  const raw = detail.confidence;
  const displayValue = raw <= 1 ? raw * 100 : raw;
  return {
    category: formatPredictionLabel(detail.prediction),
    confidenceText: displayValue.toFixed(2),
    isLowConfidence: displayValue < 50,
  };
}

function HistoryPreviewContent({ detail }: { detail: PredictHistoryDetail }) {
  const analysisSummary = detailToSummary(detail);
  const rawImage =
    detail.imageUrl ?? detail.image ?? detail.url ?? null;
  const imageSrc =
    rawImage != null && rawImage !== "" ? resolveApiMediaUrl(rawImage) : null;

  return (
    <>
      {imageSrc ? (
        <div className="mb-8 rounded-2xl overflow-hidden max-w-2xl mx-auto">
          <img src={imageSrc} alt="Scan from history" className="w-full" />
        </div>
      ) : null}

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="rounded-2xl border-2 border-[#3FA9F5]/25 bg-white/90 p-6 shadow-sm text-center">
          <p className="text-sm font-medium text-gray-500 mb-2">Prediction</p>
          <h3 className="text-2xl font-bold text-gray-900">
            {analysisSummary.category}
          </h3>
        </div>

        <div
          className={`p-6 rounded-2xl border-2 ${
            analysisSummary.isLowConfidence
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-yellow-50 border-yellow-200 text-yellow-700"
          }`}
        >
          <div className="flex items-start gap-3 mb-3">
            <div
              className={
                analysisSummary.isLowConfidence
                  ? "text-green-500"
                  : "text-yellow-500"
              }
            >
              {analysisSummary.isLowConfidence ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <AlertTriangle className="w-6 h-6" />
              )}
            </div>
            <h4 className="font-semibold text-lg">Confidence</h4>
          </div>
          <p className="text-2xl font-bold tabular-nums">
            {analysisSummary.confidenceText}%
          </p>
        </div>
      </div>

      {detail.createdAt ? (
        <p className="text-center text-sm text-gray-500 mt-6">
          {new Date(detail.createdAt).toLocaleString()}
        </p>
      ) : null}
    </>
  );
}

type Props = {
  onClose: () => void;
  query: UseQueryResult<PredictHistoryDetail, Error>;
};

export function AIToolHistoryPreview({ onClose, query }: Props) {
  return (
    <div className="mb-10">
      <Card variant="glass">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Saved scan preview</h2>
            <p className="text-gray-600">
              Prediction loaded from your history
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
            aria-label="Close preview"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {query.isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-gray-600">
            <Loader2 className="w-8 h-8 animate-spin text-[#3FA9F5]" />
            <span>Loading scan…</span>
          </div>
        )}

        {query.isError && (
          <div className="py-8 space-y-4 text-center">
            <p className="text-sm text-red-600" role="alert">
              Could not load this scan. It may have been removed.
            </p>
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}

        {query.isSuccess && query.data ? (
          <HistoryPreviewContent detail={query.data} />
        ) : null}
      </Card>
    </div>
  );
}
