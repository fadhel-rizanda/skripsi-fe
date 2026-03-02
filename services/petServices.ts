
import api from "@/lib/axios";
import { Pet, PetDetail, PetFilterState } from "@/types/pet";
import { ApiResponse, PaginatedResponse } from "@/types/api";

interface PetListParams extends PetFilterState {
  page?: number;
  per_page?: number;
}

export type CreatePetPayload = {
  name: string
  breed: string
  size: "small" | "medium" | "large" | "extra large"
  date_of_birth: string
  gender: "male" | "female"
  about: string
  special_needs: boolean
  type_of_animal_id: string
  profile_picture_ids: string[]
  physique_ids: string[]
  personality_ids: string[]
  additional_record_ids?: string[]
  use_owner_address?: boolean
  address?: {
    street: string
    province_id: string
    regency_id: string
    district_id: string
    zip_code?: string
    notes?: string
    link?: string
  }
}

export const petService = {
  // Get list of pets via Next.js API route (no auth, public access)
  getPetsPublic: async (params?: PetListParams, signal?: AbortSignal): Promise<PaginatedResponse<Pet[]>> => {
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
  getPets: async (params?: PetListParams): Promise<PaginatedResponse<Pet[]>> => {
    const response = await api.get<PaginatedResponse<Pet[]>>("/v1/pets", { params });
    return response.data;
  },

  // Get single pet detail by ID
  getPetById: async (id: string | number): Promise<PetDetail> => {
    const response = await api.get<ApiResponse<PetDetail>>(`/v1/pets/${id}`);
    return response.data.data;
  },

  // Create new pet
  createPet: async (data: CreatePetPayload) => {
    const response = await api.post("/v1/pets", data);
    return response.data;
  },

  // Update existing pet
  updatePet: async (id: string | number, data: CreatePetPayload) => {
    const response = await api.put(`/v1/pets/${id}`, data);
    return response.data;
  },

  // Delete pet
  deletePet: async (id: string | number) => {
    const response = await api.delete(`/v1/pets/${id}`);
    return response.data;
  },

  // Search pets by name or description
  searchPets: async (query: string, params?: Omit<PetListParams, 'search'>): Promise<PaginatedResponse<Pet[]>> => {
    const response = await api.get<PaginatedResponse<Pet[]>>("/v1/pets", {
      params: { ...params, search: query }
    });
    return response.data;
  },

  // Adopt a pet
  adoptPet: async (petId: string | number, note?: string) => {
    const response = await api.post(`/v1/pets/${petId}/adopt`, { note });
    return response.data;
  },

  reject: async (petId: string, adoptionId: string, signal?: AbortSignal) => {
    const response = await api.post(`/v1/pets/${petId}/adopt/${adoptionId}/reject`, {signal});
    return response.data;
  },

  cancel: async (petId: string, adoptionId: string, signal?: AbortSignal) => {
    const response = await api.post(`/v1/pets/${petId}/adopt/${adoptionId}/cancel`, {signal});
    return response.data;
  },

  takedownPet: async (id: string, notes: string): Promise<void> => {
    const encodedId = encodeURIComponent(id);
    await api.post(`/v1/pets/${encodedId}/takedown`, { notes });
  },
  restorePet: async (id: string, notes: string): Promise<void> => {
    const encodedId = encodeURIComponent(id);
    await api.post(`/v1/pets/${encodedId}/restore`, { notes });
  },
};
