import api from "@/lib/axios";

// Interfaces
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

export interface PostListParams {
    page?: number;
    per_page?: number;
    search?: string;
    sort_by?: "title" | "created_at" | "updated_at";
    sort_direction?: "asc" | "desc";
    community_id?: string;
    tag_id?: string;
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

export const postService = {
    // Get list of posts with filters and pagination
    getPosts: async (params?: PostListParams): Promise<PostListResponse> => {
        const response = await api.get<PostListResponse>("/v1/posts", { params });
        return response.data;
    },

    // Get single post detail by ID
    getPostById: async (id: string): Promise<Post> => {
        const response = await api.get<PostDetailResponse>(`/v1/posts/${id}`);
        return response.data.data;
    },

    // Create new post
    createPost: async (data: CreatePostPayload) => {
        const response = await api.post("/v1/posts", data);
        return response.data;
    },

    // Update existing post
    updatePost: async (id: string, data: UpdatePostPayload) => {
        const response = await api.put(`/v1/posts/${id}`, data);
        return response.data;
    },

    // Delete post
    deletePost: async (id: string) => {
        const response = await api.delete(`/v1/posts/${id}`);
        return response.data;
    },

    // Like/Unlike post
    likePost: async (id: string) => {
        const response = await api.post(`/v1/posts/${id}/likes`);
        return response.data;
    },

    // Search posts
    searchPosts: async (query: string, params?: Omit<PostListParams, 'search'>): Promise<PostListResponse> => {
        const response = await api.get<PostListResponse>("/v1/posts", {
            params: { ...params, search: query }
        });
        return response.data;
    },

    // Get comments for a post
    getComments: async (postId: string, params?: { page?: number; per_page?: number }): Promise<CommentListResponse> => {
        const response = await api.get<CommentListResponse>(`/v1/posts/${postId}/comments`, { params });
        return response.data;
    },

    // Create a comment on a post
    createComment: async (postId: string, data: CreateCommentPayload) => {
        const response = await api.post(`/v1/posts/${postId}/comments`, data);
        return response.data;
    },

    // Delete a comment
    deleteComment: async (postId: string, commentId: string) => {
        const response = await api.delete(`/v1/posts/${postId}/comments/${commentId}`);
        return response.data;
    },
};

