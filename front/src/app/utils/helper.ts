export type ScanStep = "upload" | "processing" | "results";

export function formatPredictionLabel(prediction: string): string {
  const spaced = prediction.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

export function goToElementById(id: string): void {
  const element = document.getElementById(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
}