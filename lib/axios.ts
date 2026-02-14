import axios, {AxiosError} from "axios";
import {getSession, signOut} from "next-auth/react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

let cachedSession: any = null;
let sessionPromise: Promise<any> | null = null;

async function getCachedSession() {
  if (sessionPromise) {
    return sessionPromise;
  }

  if (cachedSession && cachedSession._fetchedAt > Date.now() - 5000) {
    return cachedSession;
  }

  sessionPromise = getSession().then(session => {
    cachedSession = session ? { ...session, _fetchedAt: Date.now() } : null;
    sessionPromise = null;
    return cachedSession;
  });

  return sessionPromise;
}

api.interceptors.request.use(async (config) => {
  const session = await getCachedSession();
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
          cachedSession = null;
          sessionPromise = null;
          if (typeof window !== "undefined") {
            await signOut({ redirect: false });
            window.location.href = "/login";
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