import api from "@/lib/axios";
import { GetAllParams, PaginatedResponse } from "@/types";
import { Report } from "@/types/general";

export interface GetReportParams extends GetAllParams {
    reference_type?: string;
    tag_id?: string;
    sort_direction?: "asc" | "desc";
}

export interface CreateReportPayload {
    reference_type: string;
    reference_id: string;
    notes: string;
    tag_ids?: string[];
}

export const reportServices = {
    getReports: async (params: GetReportParams, signal?: AbortSignal): Promise<PaginatedResponse<Report[]>> => {
        const response = await api.get("/api/v1/reports", { params, signal });
        return response.data;
    },
    createReport: async (data: CreateReportPayload): Promise<Report> => {
        const response = await api.post("/api/v1/reports", data);
        return response.data.data;
    },
}