import api from "@/lib/axios";
import {GetAllParams, NotificationPaginatedResponse} from "@/types";

export const notificationService = {
    getNotifications: async (params: GetAllParams, signal?: AbortSignal): Promise<NotificationPaginatedResponse> => {
        const response = await api.get("/v1/notifications", {params, signal})
        return response.data
    },

    markAsRead: async (id: string): Promise<void> => {
        const response = await api.post(`/v1/notifications/${id}/mark-as-read`);
        return response.data.data;
    },

    markAsUnread: async (id: string): Promise<void> => {
        const response = await api.post(`/v1/notifications/${id}/mark-as-unread`);
        return response.data.data;
    },

    markAllAsRead: async (): Promise<void> => {
        const response = await api.post(`/v1/notifications/mark-all-as-read`);
        return response.data.data;
    },

    markAllAsUnread: async (): Promise<void> => {
        const response = await api.post(`/v1/notifications/mark-all-as-unread`);
        return response.data.data;
    },

    deleteNotification: async (id: string): Promise<void> => {
        const response = await api.delete(`/v1/notifications/${id}`);
        return response.data.data;
    },
}