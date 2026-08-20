import { useMutation } from "@tanstack/react-query";
import {
  authService,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  SigninPayload,
  SignupPayload,
  VerifyOtpPayload,
} from "../services/auth.service";

export function useSignupMutation() {
  return useMutation({
    mutationFn: (payload: SignupPayload) => authService.signup(payload),
    onSuccess: (response) => {
      if (response?.accessToken) {
        localStorage.setItem("accessToken", response.accessToken);
        window.dispatchEvent(new Event("auth-changed"));
      }
    },
  });
}

export function useSigninMutation() {
  return useMutation({
    mutationFn: (payload: SigninPayload) => authService.signin(payload),
    onSuccess: (response) => {
      if (response?.accessToken) {
        localStorage.setItem("accessToken", response.accessToken);
        window.dispatchEvent(new Event("auth-changed"));
      }
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      authService.forgotPassword(payload),
  });
}

export function useVerifyOtpMutation() {
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => authService.verifyOtp(payload),
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      authService.resetPassword(payload),
  });
}
