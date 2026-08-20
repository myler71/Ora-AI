import { Camera, CheckCircle, ImageIcon, Upload } from "lucide-react";
import { Button } from "../../Button";
import { Card } from "../../Card";
import { AIToolTrialBanners } from "./AIToolTrialBanners";

type Props = {
  showTrialWelcome: boolean;
  trialExhausted: boolean;
  trialsLeft: number;
  onDismissWelcome: () => void;
  uploadError: string | null;
  isPending: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function AIToolUploadStep({
  showTrialWelcome,
  trialExhausted,
  trialsLeft,
  onDismissWelcome,
  uploadError,
  isPending,
  onFileChange,
}: Props) {
  return (
    <Card variant="glass" className="text-center">
      <div className="max-w-2xl mx-auto">
        <AIToolTrialBanners
          showTrialWelcome={showTrialWelcome}
          trialExhausted={trialExhausted}
          trialsLeft={trialsLeft}
          onDismissWelcome={onDismissWelcome}
        />

        <div className="w-20 h-20 bg-gradient-to-br from-[#3FA9F5] to-[#1F6FEB] rounded-full flex items-center justify-center mx-auto mb-6">
          <Camera className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-4">Upload Your Teeth Photo</h2>
        <p className="text-gray-600 mb-8">
          For best results, take a clear photo of your teeth in good lighting.
          Smile naturally and ensure all teeth are visible.
        </p>

        <div
          className={`border-4 border-dashed border-[#3FA9F5]/30 rounded-3xl p-12 mb-6 bg-white/50 ${
            trialExhausted || isPending
              ? "opacity-50 pointer-events-none cursor-not-allowed"
              : "hover:border-[#3FA9F5] transition-colors cursor-pointer"
          }`}
          onClick={() =>
            !trialExhausted &&
            document.getElementById("file-upload")?.click()
          }
        >
          <Upload className="w-16 h-16 text-[#3FA9F5] mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">
            Drag & Drop your photo here
          </p>
          <p className="text-gray-600 mb-4">or click to browse</p>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={onFileChange}
            disabled={isPending || trialExhausted}
            className="hidden"
          />
        </div>

        {uploadError && (
          <p className="text-red-600 text-sm mb-4" role="alert">
            {uploadError}
          </p>
        )}

        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => document.getElementById("file-upload")?.click()}
            disabled={isPending || trialExhausted}
          >
            <ImageIcon className="w-5 h-5" />
            Choose Photo
          </Button>
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span>Secure & encrypted upload</span>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span>Results appears in seconds</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
