import api from "@/lib/axios";
import {District, Province, Regency, Status, Tag} from "@/types/general";
import { GetAllParams, UserProfile } from "@/types";

export const generalService = {
  // Get all tags with optional type filter
  getTags: async (type?: string, signal?: AbortSignal, page: number = 1, search?: string): Promise<Tag[]> => {
    const params = type ? { type, search, page } : {};
    const response = await api.get("/api/v1/general/tags", { params, signal });
    return response.data.data;
  },

  getStatuses: async (type?: string, signal?: AbortSignal, page: number = 1, search?: string): Promise<Status[]> => {
    const params = type ? { type, search, page } : {};
    const response = await api.get("/api/v1/general/statuses", { params, signal });
    return response.data.data;
  },

  // Get animal types
  getAnimalTypes: async (): Promise<Tag[]> => {
    return generalService.getTags("type_of_animal");
  },

  // Get tag personalities
  getTagPersonalities: async (): Promise<Tag[]> => {
    return generalService.getTags("personality");
  },

  getRoles: async (signal?: AbortSignal, page: number = 1, search?: string): Promise<{ id: string, name: string }[]> => {
    const params = { page, search };
    const response = await api.get("/api/v1/general/roles", { params, signal });
    return response.data.data;
  },

  getUsers: async (params: GetAllParams, signal?: AbortSignal): Promise<UserProfile[]> => {
    const response = await api.get("/api/v1/general/users", { params, signal });
    return response.data.data;
  },

  getProvinces: async (params: GetAllParams, signal?: AbortSignal): Promise<Province[]> => {
    const response = await api.get("/api/v1/general/provinces", { params, signal });
    return response.data.data;
  },

  getRegencies: async (provinceId: string, params: GetAllParams, signal?: AbortSignal): Promise<Regency[]> => {
    const response = await api.get(`/api/v1/general/provinces/${provinceId}/regencies`, { params, signal });
    return response.data.data;
  },

  getDistricts: async (regencyId: string, params: GetAllParams, signal?: AbortSignal): Promise<District[]> => {
    const response = await api.get(`/api/v1/general/regencies/${regencyId}/districts`, { params, signal });
    return response.data.data;
  },
};