import { axiosInstance } from "./axiosInstance";

export interface User {
  id: string;
  name?: string;
  email: string;
}

export interface UserApiResponse<T = unknown> {
  message?: string;
  data?: T;
  user?: T;
}

export interface UpdateMePayload {
  name?: string;
  email?: string;
  password?: string;
}

const USER_PREFIX = "/api/users";

export const userService = {
  getMe: async () => {
    const { data } = await axiosInstance.get<UserApiResponse<User>>(
      `${USER_PREFIX}/me`,
    );
    return data;
  },

  updateMe: async (payload: UpdateMePayload) => {
    const { data } = await axiosInstance.patch<UserApiResponse<User>>(
      `${USER_PREFIX}/me`,
      payload,
    );
    return data;
  },
};
