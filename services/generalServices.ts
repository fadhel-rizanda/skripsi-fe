import api from "@/lib/axios";

export interface Tag {
  id: string;
  name: string;
  type: string;
}

interface TagsResponse {
  data: Tag[];
}

export const generalService = {
  // Get all tags with optional type filter
  getTags: async (type?: string): Promise<Tag[]> => {
    const params = type ? { type } : {};
    const response = await api.get<TagsResponse>("/v1/tags", { params });
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
