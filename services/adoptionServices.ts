import api from "@/lib/axios";
import {AdoptionFilterState, ApiResponse, PaginatedResponse} from "@/types";
import {Adoption, MeetNGreet, Requirement} from "@/types/adoption";
import {
    CreateMeetNGreetInput,
    CreateRequirementInput,
    RejectInput,
    UpdateRequirementInput
} from "@/schemas/adoption.schema";

export const adoptionServices = {
    getAllAdoptions: async (params: AdoptionFilterState, signal?: AbortSignal): Promise<PaginatedResponse<Adoption[]>> => {
        const response = await api.get("/v1/adoptions", {params, signal});
        return response.data;
    },
    getAdoptionById: async (id: string, signal?: AbortSignal): Promise<ApiResponse<Adoption>> => {
        const response = await api.get(`/v1/adoptions/${id}`, {signal});
        return response.data;
    },
}

export const requirementServices = {
    getRequirementsByAdoptionId: async (adoptionId: string, signal?: AbortSignal):Promise<ApiResponse<Requirement[]>> => {
        const response = await api.get(`/v1/adoptions/${adoptionId}/requirements`, {signal});
        return response.data;
    },

    createRequirements: async (adoptionId: string, data: CreateRequirementInput, signal?: AbortSignal) => {
        const response = await api.post(`/v1/adoptions/${adoptionId}/requirements`, data, {signal});
        return response.data;
    },

    updateRequirement: async (adoptionId: string, requirementId: string, data: UpdateRequirementInput, signal?: AbortSignal) => {
        const response = await api.patch(`/v1/adoptions/${adoptionId}/requirements/${requirementId}`, data, {signal});
        return response.data;
    },

    deleteRequirementById: async (adoptionId: string, requirementId: string, signal?: AbortSignal) => {
        const response = await api.delete(`/v1/adoptions/${adoptionId}/requirements/${requirementId}`, {signal});
        return response.data;
    },

    fillRequirement: async (adoptionId: string, requirementId: string, attachmentId: string, signal?: AbortSignal) => {
        const response = await api.post(`/v1/adoptions/${adoptionId}/requirements/${requirementId}/fill`, { attachment_id: attachmentId }, {signal});
        return response.data;
    },

    approveRequirement: async (adoptionId: string, requirementId: string, signal?: AbortSignal) => {
        const response = await api.patch(`/v1/adoptions/${adoptionId}/requirements/${requirementId}/approve`, {}, {signal});
        return response.data;
    },

    rejectRequirement: async (adoptionId: string, requirementId: string, data: RejectInput, signal?: AbortSignal) => {
        const response = await api.patch(`/v1/adoptions/${adoptionId}/requirements/${requirementId}/reject`, data, {signal});
        return response.data;
    },

    finalizeRequirements: async (adoptionId: string) => {
        const response = await api.patch(`/v1/adoptions/${adoptionId}/requirements/finalize`);
        return response.data;
    },
}

export const meetNGreetServices = {
    getMeetNGreet: async (adoptionId: string, signal?: AbortSignal): Promise<ApiResponse<MeetNGreet>> => {
        const response = await api.get(`/v1/adoptions/${adoptionId}/meet-n-greet`, {signal});
        return response.data;
    },

    createMeetNGreet: async (adoptionId: string, data: CreateMeetNGreetInput, signal?: AbortSignal) => {
        const response = await api.post(`/v1/adoptions/${adoptionId}/meet-n-greet`, data, {signal});
        return response.data;
    },

    updateMeetNGreet: async (adoptionId: string, meetNGreetId: string, data: CreateMeetNGreetInput, signal?: AbortSignal) => {
        const response = await api.put(`/v1/adoptions/${adoptionId}/meet-n-greet/${meetNGreetId}`, data, {signal});
        return response.data;
    },

    approveMeetNGreet: async (adoptionId: string, meetNGreetId: string, signal?: AbortSignal) => {
        const response = await api.patch(`/v1/adoptions/${adoptionId}/meet-n-greet/${meetNGreetId}/approve`, {}, {signal});
        return response.data;
    },

    finalizeMeetNGreet: async (adoptionId: string, meetNGreetId: string, signal?: AbortSignal) => {
        const response = await api.patch(`/v1/adoptions/${adoptionId}/meet-n-greet/${meetNGreetId}/finalize`, {}, {signal});
        return response.data;
    }
}

export const handoverServices = {
    getHandover: async (adoptionId: string, signal?: AbortSignal) => {
        const response = await api.get(`/v1/adoptions/${adoptionId}/handover`, {signal});
        return response.data;
    },

    createHandover: async (adoptionId: string, data: CreateMeetNGreetInput, signal?: AbortSignal) => {
        const response = await api.post(`/v1/adoptions/${adoptionId}/handover/meet-n-greet`, data, {signal});
        return response.data;
    },

    updateHandoverSchedule: async (adoptionId: string, handoverId: string, data: CreateMeetNGreetInput, signal?: AbortSignal) => {
        const response = await api.put(`/v1/adoptions/${adoptionId}/handover/${handoverId}/meet-n-greet`, data, {signal});
        return response.data;
    },

    approveHandover: async (adoptionId: string, handoverId: string, signal?: AbortSignal) => {
        const response = await api.patch(`/v1/adoptions/${adoptionId}/handover/${handoverId}/meet-n-greet/approve`, {}, {signal});
        return response.data;
    },

    setHandoverEvidence: async (adoptionId: string, handoverId: string, attachmentIds: string[], signal?: AbortSignal) => {
        const response = await api.post(`/v1/adoptions/${adoptionId}/handover/${handoverId}/evidence`, {attachment_ids: attachmentIds}, {signal});
        return response.data;
    },

    finalizeHandover: async (adoptionId: string, handoverId: string, signal?: AbortSignal) => {
        const response = await api.patch(`/v1/adoptions/${adoptionId}/handover/${handoverId}/finalize`, {}, {signal});
        return response.data;
    }
}