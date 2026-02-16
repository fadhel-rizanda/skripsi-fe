import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Whitelist of allowed query parameters
const ALLOWED_PARAMS = [
    'page',
    'per_page',
    'search',
    'sort_by',
    'community_id',
    'tag_id'
] as const;

// Server-side post service for API routes
const postService = {
    getPosts: async (params: Record<string, string>) => {
        const queryParams = new URLSearchParams();

        // Build query string from params
        Object.entries(params).forEach(([key, value]) => {
            if (value && ALLOWED_PARAMS.includes(key as typeof ALLOWED_PARAMS[number])) {
                queryParams.set(key, value);
            }
        });

        const queryString = queryParams.toString();
        const url = `${API_URL}/v1/posts${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-store', // Disable caching for fresh data
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend error [${response.status}]:`, errorText);
            throw new Error(`Failed to fetch posts: ${response.status}`);
        }

        return await response.json();
    }
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        // Extract and validate query parameters
        const params: Record<string, string> = {};
        ALLOWED_PARAMS.forEach((param) => {
            const value = searchParams.get(param);
            if (value) {
                params[param] = value;
            }
        });

        // Use postService to fetch data
        const data = await postService.getPosts(params);
        return NextResponse.json(data);

    } catch (error) {
        // Log detailed error on server for debugging
        console.error('[API Route] Error:', error);

        // Return generic error message to client
        return NextResponse.json(
            { message: "An error occurred while fetching posts. Please try again later." },
            { status: 500 }
        );
    }
}
