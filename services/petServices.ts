import api from "@/lib/axios";
import { Pet, PetFilterState } from "@/types/pet";

interface PetListResponse {
  data: Pet[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

interface PetDetailResponse {
  data: Pet;
}

interface PetListParams extends PetFilterState {
  page?: number;
  limit?: number;
}

export const petService = {
  // Get list of pets via Next.js API route (no auth, public access)
  getPetsPublic: async (params?: PetListParams, signal?: AbortSignal): Promise<PetListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.limit) queryParams.set("limit", params.limit.toString());
    if (params?.age) queryParams.set("age", params.age);
    if (params?.type_of_animal_id) queryParams.set("type_of_animal_id", params.type_of_animal_id);
    if (params?.tag_personality_id) queryParams.set("tag_personality_id", params.tag_personality_id);
    if (params?.search) queryParams.set("search", params.search);

    const queryString = queryParams.toString();
    const url = `/api/pet${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, { signal });
    
    if (!response.ok) {
      throw new Error('Failed to fetch pets');
    }
    
    return await response.json();
  },

  // Get list of pets with filters and pagination (requires auth)
  getPets: async (params?: PetListParams): Promise<PetListResponse> => {
    const response = await api.get("/v1/pets", { params });
    return response.data;
  },

  // Get single pet detail by ID
  getPetById: async (id: string | number): Promise<Pet> => {
    const response = await api.get<PetDetailResponse>(`/v1/pets/${id}`);
    return response.data.data;
  },

  // Create new pet
  createPet: async (data: Partial<Pet>) => {
    const response = await api.post("/v1/pets", data);
    return response.data;
  },

  // Update existing pet
  updatePet: async (id: string | number, data: Partial<Pet>) => {
    const response = await api.put(`/v1/pets/${id}`, data);
    return response.data;
  },

  // Delete pet
  deletePet: async (id: string | number) => {
    const response = await api.delete(`/v1/pets/${id}`);
    return response.data;
  },

  // Search pets by name or description
  searchPets: async (query: string, params?: Omit<PetListParams, 'search'>): Promise<PetListResponse> => {
    const response = await api.get("/v1/pets", {
      params: { ...params, search: query }
    });
    return response.data;
  },
};
