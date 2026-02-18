
import api from "@/lib/axios";

export interface Tag {
    id: string;
    name: string;
    type: string;
    color_code: string;
}

export interface CreatedBy {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
    is_active: boolean;
}

export interface Post {
    id: string;
    title: string;
    content: string;
    image_url: string | null;
    attachment: any;
    created_at: string;
    updated_at: string;
    tags: Tag[];
    likes_count: number;
    comments_count: number;
    created_by: CreatedBy;
}

export interface PostListResponse {
    error: boolean;
    status: string;
    message: string;
    data: Post[];
    current_page: number;
    per_page: number;
    total: number;
    has_more_pages: boolean;
}

export interface PostDetailResponse {
    error: boolean;
    status: string;
    message: string;
    data: Post;
}

export interface GetAllParams {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: "title" | "created_at" | "updated_at" | "popular";
    sort_direction?: "asc" | "desc";
    community_id?: string;
    tag_id?: string;
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
    getPosts: async (params?: GetAllParams): Promise<PostListResponse> => {
        const response = await api.get<PostListResponse>("/v1/posts", { params });
        return response.data;
    },
    getPostById: async (id: string): Promise<Post> => {
        const response = await api.get<PostDetailResponse>(`/v1/posts/${id}`);
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
    searchPosts: async (query: string, params?: Omit<GetAllParams, 'search'>): Promise<PostListResponse> => {
        const response = await api.get<PostListResponse>("/v1/posts", {
            params: { ...params, search: query }
        });
        return response.data;
    },
};

