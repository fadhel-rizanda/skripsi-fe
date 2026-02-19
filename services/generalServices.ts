import api from "@/lib/axios";
import {Status} from "@/types/general";
import {GetAllParams, UserProfile} from "@/types";

export interface Tag {
  id: string;
  name: string;
  type: string;
}

export const generalService = {
  // Get all tags with optional type filter
  getTags: async (type?: string, signal?: AbortSignal, page: number=1, search?: string): Promise<Tag[]> => {
    const params = type ? { type, search, page } : {};
    const response = await api.get("/v1/general/tags", { params, signal });
    return response.data.data;
  },

  getStatuses: async (type?: string, signal?: AbortSignal,  page: number=1, search?: string): Promise<Status[]> => {
    const params = type ? { type, search, page } : {};
    const response = await api.get("/v1/general/statuses", { params, signal });
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

  getUsers: async (params: GetAllParams, signal?: AbortSignal): Promise<UserProfile[]> => {
    const response = await api.get("/v1/general/users", {params, signal});
    return response.data.data;
  },
};