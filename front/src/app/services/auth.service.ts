import { axiosInstance } from "./axiosInstance";

export interface SignupPayload {
  email: string;
  password: string;
}

export interface SigninPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ResetPasswordPayload {
  resetToken: string;
  newPassword: string;
}

export interface AuthApiResponse<T = unknown> {
  message?: string;
  data?: T;
  accessToken?: string;
  resetToken?: string;
}

const AUTH_PREFIX = "/api/auth";

export const authService = {
  signup: async (payload: SignupPayload) => {
    const { data } = await axiosInstance.post<AuthApiResponse>(
      `${AUTH_PREFIX}/signup`,
      payload,
    );
    return data;
  },

  signin: async (payload: SigninPayload) => {
    const { data } = await axiosInstance.post<AuthApiResponse>(
      `${AUTH_PREFIX}/signin`,
      payload,
    );
    return data;
  },

  forgotPassword: async (payload: ForgotPasswordPayload) => {
    const { data } = await axiosInstance.post<AuthApiResponse>(
      `${AUTH_PREFIX}/forgot-password`,
      payload,
    );
    return data;
  },

  verifyOtp: async (payload: VerifyOtpPayload) => {
    const { data } = await axiosInstance.post<AuthApiResponse>(
      `${AUTH_PREFIX}/verify-otp`,
      payload,
    );
    return data;
  },

  resetPassword: async (payload: ResetPasswordPayload) => {
    const { data } = await axiosInstance.post<AuthApiResponse>(
      `${AUTH_PREFIX}/reset-password`,
      payload,
    );
    return data;
  },
};
