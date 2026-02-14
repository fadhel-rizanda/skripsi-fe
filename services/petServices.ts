import api from "@/lib/axios";
import { Pet, PetDetail, PetFilterState } from "@/types/pet";

interface PetListResponse {
  data: Pet[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}

interface PetDetailResponse {
  data: PetDetail;
}

interface PetListParams extends PetFilterState {
  page?: number;
  per_page?: number;
}

export const petService = {
  // Get list of pets via Next.js API route (no auth, public access)
  getPetsPublic: async (params?: PetListParams, signal?: AbortSignal): Promise<PetListResponse> => {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.per_page) queryParams.set("per_page", params.per_page.toString());
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
  getPetById: async (id: string | number): Promise<PetDetail> => {
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
    // Log the outgoing update for debugging (will appear in Node/Browser console depending on where api is used)
    try {
      console.log("petService.updatePet: calling PUT /v1/pets/" + id, data);
    } catch (err) {
      console.warn("petService.updatePet: unable to log request data", err);
    }

    try {
      const response = await api.put(`/v1/pets/${id}`, data);
      try {
        console.log("petService.updatePet: response received", response?.status);
      } catch {}
      return response.data;
    } catch (err) {
      console.error("petService.updatePet: request failed", err);
      throw err;
    }
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

  // Adopt a pet
  adoptPet: async (petId: string | number, note?: string) => {
    const response = await api.post(`/v1/pets/${petId}/adopt`, { note });
    return response.data;
  },
};
