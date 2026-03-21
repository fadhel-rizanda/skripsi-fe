import api from "@/lib/axios";
import {GetAllParams, NotificationPaginatedResponse} from "@/types";

export const notificationService = {
    getNotifications: async (params: GetAllParams, signal?: AbortSignal): Promise<NotificationPaginatedResponse> => {
        const response = await api.get("/api/v1/notifications", {params, signal})
        return response.data
    },

    markAsRead: async (id: string): Promise<void> => {
        await api.post(`/api/v1/notifications/${id}/mark-as-read`);
        return;
    },

    markAsUnread: async (id: string): Promise<void> => {
        await api.post(`/api/v1/notifications/${id}/mark-as-unread`);
        return;
    },

    markAllAsRead: async (): Promise<void> => {
        await api.post(`/api/v1/notifications/mark-all-as-read`);
        return;
    },

    markAllAsUnread: async (): Promise<void> => {
        await api.post(`/api/v1/notifications/mark-all-as-unread`);
        return;
    },

    deleteNotification: async (id: string): Promise<void> => {
        await api.delete(`/api/v1/notifications/${id}`);
        return;
    },
}