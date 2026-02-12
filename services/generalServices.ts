import api from "@/lib/axios";
import {Status} from "@/types/general";

export interface Tag {
  id: string;
  name: string;
  type: string;
}

export const generalService = {
  // Get all tags with optional type filter
  getTags: async (type?: string, signal?: AbortSignal): Promise<Tag[]> => {
    const params = type ? { type } : {};
    const response = await api.get("/v1/tags", { params, signal });
    return response.data.data;
  },

  getStatuses: async (type?: string, signal?: AbortSignal): Promise<Status[]> => {
    const params = type ? { type } : {};
    const response = await api.get("/v1/statuses", { params, signal });
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
};
