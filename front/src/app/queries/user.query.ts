import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UpdateMePayload, userService } from "../services/user.service";

export const userKeys = {
  me: ["me"] as const,
};

export function useMeQuery(enabled = true) {
  return useQuery({
    queryKey: userKeys.me,
    queryFn: () => userService.getMe(),
    enabled,
  });
}

export function useUpdateMeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMePayload) => userService.updateMe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.me });
    },
  });
}
