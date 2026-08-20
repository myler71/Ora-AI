import {
  AlertTriangle,
  CheckCircle,
  Upload,
  X,
  BookOpen,
  MapPin,
} from "lucide-react";
import { Button } from "../../Button";
import { Card } from "../../Card";
import { useNavigate } from "react-router";

export type AnalysisSummary = {
  category: string;
  confidenceText: string;
  isLowConfidence: boolean;
  rawPrediction: string;
};

type Props = {
  uploadedImage: string | null;
  analysisSummary: AnalysisSummary;
  onReset: () => void;
  isMapVisible: boolean;
  onToggleMap: () => void;
};

const PREDICTION_TO_BLOG_ID: Record<string, number> = {
  CARIES: 1,
  DENTAL_CARIES: 1,
  CALCULUS: 2,
  GINGIVITIS: 3,
  TOOTHDISCOLORATION: 4,
  ULCERS: 5,
  HYPODONTIA: 6,
};

export function AIToolResultsStep({
  uploadedImage,
  analysisSummary,
  onReset,
  isMapVisible,
  onToggleMap,
}: Props) {
  const navigate = useNavigate();
  const blogId =
    PREDICTION_TO_BLOG_ID[analysisSummary.rawPrediction.toUpperCase()];

  return (
    <div className="space-y-6">
      <Card variant="glass">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Analysis Complete</h2>
            <p className="text-gray-600">
              Your AI dental health report is ready
            </p>
          </div>
          <button
            type="button"
            onClick={onReset}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {uploadedImage && (
          <div className="mb-8 rounded-2xl overflow-hidden max-w-2xl mx-auto">
            <img src={uploadedImage} alt="Uploaded teeth" className="w-full" />
          </div>
        )}

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
      </Card>

      <div className="flex flex-wrap gap-4 justify-center">
        {blogId && (
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate(`/blogs/${blogId}`)}
          >
            <BookOpen className="w-5 h-5" />
            Read about this
          </Button>
        )}
        <Button variant="secondary" size="lg" onClick={onToggleMap}>
          <MapPin className="w-5 h-5" />
          {isMapVisible ? "Hide Map" : "Find Dentist Nearby"}
        </Button>
        <Button variant="outline" size="lg" onClick={onReset}>
          <Upload className="w-5 h-5" />
          Scan Another Photo
        </Button>
      </div>
    </div>
  );
}
