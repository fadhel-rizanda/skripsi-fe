import api from "@/lib/axios";
import {PresignedUrlInput} from "@/schemas/attachment.schema";
import axios from "axios";

export const attachmentService = {
    getPresignedUrl: async (data: PresignedUrlInput) => {
        const response = await api.post("/v1/attachments/presigned-url", data);
        return response.data;
    },

    confirmUpload: async (id: string) => {
        const response = await api.patch(`/v1/attachments/${id}/confirm`);
        return response.data;
    },

    uploadToS3: async (url: string, file: File, onProgress?: (pct: number) => void) => {
        return await axios.put(url, file, {
            headers: { "Content-Type": file.type },
            onUploadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            }
        });
    },

    generateDownloadUrl: async (id: string) => {
        const response = await api.get(`/v1/attachments/${id}/download-url`);
        return response.data.data;
    },

    downloadFromS3: async (url: string, mime_type: string, onProgress?: (pct: number) => void) => {
        const response = await axios.get(url, {
            responseType: 'blob',
            headers: { "Content-Type": mime_type },
            onDownloadProgress: (progressEvent) => {
                if (onProgress && progressEvent.total) {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    onProgress(percentCompleted);
                }
            }
        });
        return response.data;
    }
};