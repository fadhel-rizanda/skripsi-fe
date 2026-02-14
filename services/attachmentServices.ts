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
        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
            xhr.upload.addEventListener("progress", (e) => {
                if (onProgress && e.lengthComputable) {
                    const percentCompleted = Math.round((e.loaded * 100) / e.total);
                    onProgress(percentCompleted);
                }
            });

            xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(xhr.response);
                } else {
                    reject(new Error(`Upload failed: ${xhr.status}`));
                }
            });

            xhr.addEventListener("error", () => reject(new Error("Upload failed")));
            xhr.addEventListener("abort", () => reject(new Error("Upload cancelled")));

            xhr.open("PUT", url);
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.send(file);
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