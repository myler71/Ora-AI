export interface ToothSvgProps {
  toothId: string;
  condition?: string;
  restoration?: string;
  attention?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

export const ANATOMICAL_TOOTH_NAMES: Record<string, string> = {
  "18": "Upper Right 3rd Molar (Wisdom)",
  "17": "Upper Right 2nd Molar",
  "16": "Upper Right 1st Molar",
  "15": "Upper Right 2nd Premolar",
  "14": "Upper Right 1st Premolar",
  "13": "Upper Right Canine",
  "12": "Upper Right Lateral Incisor",
  "11": "Upper Right Central Incisor",
  "21": "Upper Left Central Incisor",
  "22": "Upper Left Lateral Incisor",
  "23": "Upper Left Canine",
  "24": "Upper Left 1st Premolar",
  "25": "Upper Left 2nd Premolar",
  "26": "Upper Left 1st Molar",
  "27": "Upper Left 2nd Molar",
  "28": "Upper Left 3rd Molar (Wisdom)",
  "31": "Lower Left Central Incisor",
  "32": "Lower Left Lateral Incisor",
  "33": "Lower Left Canine",
  "34": "Lower Left 1st Premolar",
  "35": "Lower Left 2nd Premolar",
  "36": "Lower Left 1st Molar",
  "37": "Lower Left 2nd Molar",
  "38": "Lower Left 3rd Molar (Wisdom)",
  "41": "Lower Right Central Incisor",
  "42": "Lower Right Lateral Incisor",
  "43": "Lower Right Canine",
  "44": "Lower Right 1st Premolar",
  "45": "Lower Right 2nd Premolar",
  "46": "Lower Right 1st Molar",
  "47": "Lower Right 2nd Molar",
  "48": "Lower Right 3rd Molar (Wisdom)",
};

export function getAnatomicalToothName(toothId: string): string {
  return ANATOMICAL_TOOTH_NAMES[toothId] || `Tooth ${toothId}`;
}

export function ToothSvg({
  toothId,
  condition = "healthy",
  restoration = "none",
  attention = false,
  isSelected = false,
  onClick,
}: ToothSvgProps) {
  const numId = parseInt(toothId, 10);
  const isUpper = numId >= 11 && numId <= 28;

  // Determine tooth morphological class
  const lastDigit = numId % 10;
  const isMolar = lastDigit >= 6;
  const isPremolar = lastDigit === 4 || lastDigit === 5;
  const isCanine = lastDigit === 3;

  // Color fills based on condition / restoration
  let crownFill = "#FFFFFF";
  let crownStroke = "#94A3B8";

  if (condition === "missing") {
    crownFill = "#F1F5F9";
    crownStroke = "#CBD5E1";
  } else if (condition === "caries") {
    crownFill = "#FEE2E2"; // Light red
    crownStroke = "#EF4444"; // Red
  } else if (condition === "gingivitis") {
    crownFill = "#FCE7F3"; // Light pink
    crownStroke = "#EC4899"; // Pink
  } else if (condition === "discoloration") {
    crownFill = "#FEF3C7"; // Light amber
    crownStroke = "#F59E0B"; // Amber
  } else if (restoration === "crown") {
    crownFill = "#F59E0B"; // Gold colored crown
    crownStroke = "#B45309";
  } else if (restoration !== "none") {
    crownFill = "#E2E8F0"; // Filled tooth base
    crownStroke = "#334155";
  }

  // Label text formatter for FDI teeth UI
  let labelText = "Healthy tooth";
  if (condition === "missing") labelText = "Missing tooth";
  else if (condition === "caries") labelText = "Caries / decayed";
  else if (condition === "gingivitis") labelText = "Gingivitis";
  else if (condition === "discoloration") labelText = "Discoloration";
  else if (condition === "ulcers") labelText = "Ulcers";
  else if (restoration === "crown") labelText = "Crowned tooth";
  else if (restoration !== "none") labelText = "Filled tooth";

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col items-center p-2 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? "ring-2 ring-blue-600 bg-blue-50/80 shadow-md scale-105"
          : attention
          ? "bg-amber-50 border border-amber-300 hover:bg-amber-100"
          : condition === "missing"
          ? "bg-slate-100/50 border border-dashed border-slate-300 opacity-60"
          : "bg-white border border-slate-200 hover:border-blue-400 hover:shadow-xs"
      }`}
    >
      {/* FDI Tooth ID Number */}
      <span
        className={`text-[10px] font-extrabold mb-1 px-1.5 py-0.2 rounded ${
          isSelected
            ? "bg-blue-600 text-white"
            : attention
            ? "bg-amber-200 text-amber-900"
            : "bg-slate-100 text-slate-700"
        }`}
      >
        {toothId}
      </span>

      {/* Anatomical SVG Graphic */}
      <svg
        width="44"
        height="56"
        viewBox="0 0 44 56"
        className={`transition-transform ${isUpper ? "" : "rotate-180"}`}
      >
        <defs>
          <linearGradient id={`grad-${toothId}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={crownFill} />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>
        </defs>

        {/* Anatomical Roots */}
        {isMolar ? (
          <g fill="#CBD5E1" stroke="#64748B" strokeWidth="1">
            <path d="M12 28 C10 16 8 6 14 2 C16 12 18 20 22 28 Z" />
            <path d="M22 28 C26 20 28 12 30 2 C36 6 34 16 32 28 Z" />
          </g>
        ) : isPremolar ? (
          <g fill="#CBD5E1" stroke="#64748B" strokeWidth="1">
            <path d="M15 28 C13 18 14 8 22 2 C30 8 31 18 29 28 Z" />
          </g>
        ) : (
          <g fill="#CBD5E1" stroke="#64748B" strokeWidth="1">
            <path d="M16 28 C15 16 18 4 22 1 C26 4 29 16 28 28 Z" />
          </g>
        )}

        {/* Anatomical Crown */}
        <g stroke={crownStroke} strokeWidth="1.5" fill={`url(#grad-${toothId})`}>
          {isMolar ? (
            <path d="M6 26 C6 22 12 20 22 20 C32 20 38 22 38 26 C40 38 38 48 34 52 C26 55 18 55 10 52 C6 48 4 38 6 26 Z" />
          ) : isCanine ? (
            <path d="M10 26 C12 22 18 19 22 17 C26 19 32 22 34 26 C36 38 34 48 30 52 C24 54 20 54 14 52 C10 48 8 38 10 26 Z" />
          ) : (
            <path d="M8 26 C8 22 14 20 22 20 C30 20 36 22 36 26 C38 38 36 48 32 52 C24 54 20 54 12 52 C8 48 6 38 8 26 Z" />
          )}

          {/* Surface Zone */}
          {/* Surface Zone / Black Filling Dot for Filled Tooth */}
          <ellipse
            cx="22"
            cy="36"
            rx={isMolar ? "7" : "5"}
            ry={isMolar ? "6" : "4"}
            fill={restoration !== "none" && restoration !== "crown" ? "#0F172A" : condition === "caries" ? "#EF4444" : "#E2E8F0"}
            opacity={restoration !== "none" || condition === "caries" ? "0.95" : "0.5"}
          />
        </g>
      </svg>

      {/* Surface Status Badge */}
      <span className="text-[9px] font-semibold text-slate-600 mt-1 truncate max-w-[54px] text-center" title={labelText}>
        {labelText}
      </span>

      {/* Attention Warning Dot */}
      {attention && (
        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white animate-pulse"></span>
      )}
    </div>
  );
}
