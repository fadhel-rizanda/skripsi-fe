import api from "@/lib/axios";
import {CreateChatInput, SendMessageInput} from "@/schemas/chat.schema";

export const chatService = {
    getAllChats: async () => {
        const response = await api.get("/api/v1/chats");
        return response.data;
    },

    createChat: async (data: CreateChatInput) => {
        const response = await api.post("/api/v1/chats", data);
        return response.data;
    },

    getMessages: async (chatId: string, beforeId?: string, limit?: number) => {
        const response = await api.get(`/api/v1/chats/${chatId}/messages`, {
            params: { before_id: beforeId, limit: limit},
        });
        return response.data;
    },

    sendMessage: async (chatId: string, data: SendMessageInput) => {
        const response = await api.post(`/api/v1/chats/${chatId}/messages`, data);
        return response.data;
    },

    markAsRead: async (chatId: string) => {
        const response = await api.patch(`/api/v1/chats/${chatId}/read`);
        return response.data;
    },

    editMessage: async (chatId: string, messageId: string, content: string) => {
        const response = await api.put(`/api/v1/chats/${chatId}/messages/${messageId}`, {content});
        return response.data;
    },

    deleteMessage: async (chatId: string, messageId: string) => {
        const response = await api.delete(`/api/v1/chats/${chatId}/messages/${messageId}`);
        return response.data;
    },

    deleteChat: async (chatId: string) => {
        const response = await api.delete(`/api/v1/chats/${chatId}`);
        return response.data;
    },

    updateChat: async (chatId: string, data: CreateChatInput) => {
        const response = await api.put(`/api/v1/chats/${chatId}`, data);
        return response.data;
    },
};
