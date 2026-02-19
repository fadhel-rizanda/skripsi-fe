import api from "@/lib/axios";
import {ApiResponse, PaginatedResponse, GetAllParams} from "@/types/api";
import {Post} from "@/types/post";

export interface GetPostsParams extends GetAllParams {
    community_id?: string;
    tag_id?: string;
    sort_direction?: "asc" | "desc"; // Extended to match backend expectation
    [key: string]: any;
}

export interface CreatePostPayload {
    title: string;
    content: string;
    attachment_id?: string;
    community_id?: string;
    tag_ids?: string[];
}

export interface UpdatePostPayload {
    title?: string;
    content?: string;
    attachment_id?: string;
    tag_ids?: string[];
}

export const postService = {
    getPosts: async (params?: GetPostsParams): Promise<PaginatedResponse<Post[]>> => {
        const response = await api.get<PaginatedResponse<Post[]>>("/v1/posts", {params});
        return response.data;
    },
    getPostById: async (id: string): Promise<Post> => {
        const response = await api.get<ApiResponse<Post>>(`/v1/posts/${id}`);
        return response.data.data;
    },
    createPost: async (data: CreatePostPayload) => {
        const response = await api.post("/v1/posts", data);
        return response.data;
    },
    updatePost: async (id: string, data: UpdatePostPayload) => {
        const response = await api.put(`/v1/posts/${id}`, data);
        return response.data;
    },
    deletePost: async (id: string) => {
        const response = await api.delete(`/v1/posts/${id}`);
        return response.data;
    },
    likePost: async (id: string) => {
        const response = await api.post(`/v1/posts/${id}/likes`);
        return response.data;
    },
    searchPosts: async (query: string, params?: Omit<GetPostsParams, 'search'>): Promise<PaginatedResponse<Post[]>> => {
        const response = await api.get<PaginatedResponse<Post[]>>("/v1/posts", {
            params: {...params, search: query}
        });
        return response.data;
    },
};
