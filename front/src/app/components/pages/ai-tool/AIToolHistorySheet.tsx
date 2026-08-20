import type { UseQueryResult } from "@tanstack/react-query";
import { History, Loader2 } from "lucide-react";
import { Button } from "../../Button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../ui/sheet";
import type { PredictHistoryItem } from "../../../services/predict.service";
import { resolveApiMediaUrl } from "../../../services/axiosInstance";
import { formatPredictionLabel } from "../../../utils/helper";

function historyItemImageSrc(item: PredictHistoryItem): string | null {
  const raw = item.imageUrl ?? item.image ?? item.url ?? null;
  if (raw == null || raw === "") return null;
  return resolveApiMediaUrl(raw);
}

type Props = {
  historyOpen: boolean;
  onHistoryOpenChange: (open: boolean) => void;
  historyQuery: UseQueryResult<PredictHistoryItem[], Error>;
  onSelectHistoryItem?: (id: string) => void;
};

export function AIToolHistorySheet({
  historyOpen,
  onHistoryOpenChange,
  historyQuery,
  onSelectHistoryItem,
}: Props) {
  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="fixed left-4 top-28 z-40 shadow-md border-[#3FA9F5]/40 bg-white/90 backdrop-blur-sm hover:bg-white"
        onClick={() => onHistoryOpenChange(true)}
      >
        <History className="w-4 h-4" />
        Scan history
      </Button>

      <Sheet open={historyOpen} onOpenChange={onHistoryOpenChange}>
        <SheetContent
          side="left"
          className="w-full sm:max-w-lg bg-white flex flex-col p-0 gap-0"
        >
          <SheetHeader className="p-6 pb-4 border-b border-gray-100 shrink-0">
            <SheetTitle className="text-xl text-gray-900">
              Prediction history
            </SheetTitle>
            <SheetDescription className="text-gray-600">
              Your past AI dental scans from this account. Tap a row to open the
              full preview on the page.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 pt-4">
            {historyQuery.isLoading && (
              <div className="flex items-center justify-center gap-2 py-12 text-gray-600">
                <Loader2 className="w-6 h-6 animate-spin text-[#3FA9F5]" />
                <span>Loading history…</span>
              </div>
            )}

            {historyQuery.isError && (
              <p className="text-sm text-red-600 py-4" role="alert">
                Could not load history. Please try again.
              </p>
            )}

            {historyQuery.isSuccess && historyQuery.data.length === 0 && (
              <p className="text-sm text-gray-600 py-8 text-center">
                No predictions yet. Run a scan to see it here.
              </p>
            )}

            {historyQuery.isSuccess && historyQuery.data.length > 0 && (
              <ul className="space-y-3 list-none p-0 m-0">
                {historyQuery.data.map((item, index) => {
                  const raw = item.confidence;
                  const pct =
                    typeof raw === "number" && raw <= 1
                      ? raw * 100
                      : Number(raw);
                  const confText = Number.isFinite(pct) ? pct.toFixed(2) : "—";
                  const key = item.id ?? `${item.prediction}-${index}`;
                  const entryId = item.id?.trim() ? item.id : undefined;
                  const canOpen = Boolean(entryId && onSelectHistoryItem);
                  const imageSrc = historyItemImageSrc(item);

                  const textBlock = (
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">
                        {formatPredictionLabel(item.prediction)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        Confidence:{" "}
                        <span
                          className={
                            pct < 50
                              ? "text-green-600 font-medium"
                              : "font-medium text-gray-800"
                          }
                        >
                          {confText}%
                        </span>
                      </p>
                      {item.createdAt && (
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      )}
                      {!entryId && (
                        <p className="text-xs text-amber-700 mt-2">
                          No record id from server — preview unavailable
                        </p>
                      )}
                    </div>
                  );

                  const rowInner = (
                    <div className="flex gap-3 items-start flex-col">
                      {imageSrc ? (
                        <div className="shrink-0 w-full h-full rounded-lg overflow-hidden bg-gray-200 border border-gray-200">
                          <img
                            src={imageSrc}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : null}
                      {textBlock}
                    </div>
                  );

                  return (
                    <li key={key}>
                      {canOpen ? (
                        <button
                          type="button"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/80 p-4 text-left transition-colors cursor-pointer hover:border-[#3FA9F5]/50 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3FA9F5]/40"
                          onClick={() =>
                            entryId &&
                            onSelectHistoryItem &&
                            onSelectHistoryItem(entryId)
                          }
                        >
                          {rowInner}
                        </button>
                      ) : (
                        <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 opacity-90">
                          {rowInner}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
