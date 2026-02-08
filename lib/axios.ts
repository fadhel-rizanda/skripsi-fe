import axios, {AxiosError} from "axios";
import {getSession, signOut} from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const session = await getSession()
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          if (typeof window !== "undefined") {
            await signOut({ redirect: false });
            window.location.href = "/login?error=unauthorized";
          }
        }
      }
      return Promise.reject(error);
    }
);

export default api;

export const handleApiError = (error: unknown) => {
  if (error instanceof AxiosError && error.response?.status === 422) {
    return error.response.data.errors;
  }
  return { message: "Something went wrong. Please try again." };
};