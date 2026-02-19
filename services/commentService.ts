import api from "@/lib/axios";

export interface Comment {
    id: string;
    content: string;
    parent_id: string | null;
    created_at: string;
    updated_at: string;
    created_by: {
        id: string;
        name: string;
        email: string;
        avatar: string | null;
        is_active: boolean;
    };
}

export interface CommentListResponse {
    error: boolean;
    status: string;
    message: string;
    data: Comment[];
    current_page: number;
    per_page: number;
    total: number;
    has_more_pages: boolean;
}

export interface CreateCommentPayload {
    content: string;
}

import { GetAllParams } from "@/types/api";

export interface GetCommentsParams extends GetAllParams {
    [key: string]: any;
}

export const commentService = {
    getComments: async (postId: string, params?: GetCommentsParams): Promise<CommentListResponse> => {
        const response = await api.get<CommentListResponse>(`/v1/posts/${postId}/comments`, { params });
        return response.data;
    },
    createComment: async (postId: string, data: CreateCommentPayload) => {
        const response = await api.post(`/v1/posts/${postId}/comments`, data);
        return response.data;
    },
    deleteComment: async (postId: string, commentId: string) => {
        const response = await api.delete(`/v1/posts/${postId}/comments/${commentId}`);
        return response.data;
    },
};
