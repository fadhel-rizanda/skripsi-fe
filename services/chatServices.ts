import api from "@/lib/axios";
import {CreateChatInput, SendMessageInput} from "@/schemas/chat.schema";

export const chatService = {
    getAllChats: async () => {
        const response = await api.get("/v1/chats");
        return response.data;
    },

    createChat: async (data: CreateChatInput) => {
        const response = await api.post("/v1/chats", data);
        return response.data;
    },

    getMessages: async (chatId: string, beforeId?: string, limit?: number) => {
        const response = await api.get(`/v1/chats/${chatId}/messages`, {
            params: { before_id: beforeId, limit: limit},
        });
        return response.data;
    },

    sendMessage: async (chatId: string, data: SendMessageInput) => {
        const response = await api.post(`/v1/chats/${chatId}/messages`, data);
        return response.data;
    },

    markAsRead: async (chatId: string) => {
        const response = await api.patch(`/v1/chats/${chatId}/read`);
        return response.data;
    },
};
