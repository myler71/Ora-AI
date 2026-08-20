import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { predictService } from "../services/predict.service";

export const predictKeys = {
  all: ["predict"] as const,
  history: () => [...predictKeys.all, "history"] as const,
  historyItem: (id: string) => [...predictKeys.all, "history", id] as const,
};

export function usePredictHistoryQuery(enabled: boolean) {
  return useQuery({
    queryKey: predictKeys.history(),
    queryFn: () => predictService.getHistory(),
    enabled,
  });
}

export function usePredictHistoryItemQuery(
  id: string | null,
  enabled: boolean,
) {
  return useQuery({
    queryKey: id
      ? predictKeys.historyItem(id)
      : [...predictKeys.all, "history-detail", "idle"],
    queryFn: () => predictService.getHistoryById(id!),
    enabled: Boolean(id && enabled),
  });
}

export function usePredictImageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => predictService.predictImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: predictKeys.history() });
    },
  });
}
