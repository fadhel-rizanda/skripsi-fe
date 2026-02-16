import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const postId = params.id;
        const url = `${API_URL}/v1/posts/${postId}`;

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-store', // Disable caching for fresh data
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend error [${response.status}]:`, errorText);

            if (response.status === 404) {
                return NextResponse.json(
                    { message: "Post not found" },
                    { status: 404 }
                );
            }

            throw new Error(`Failed to fetch post: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('[API Route] Error:', error);

        return NextResponse.json(
            { message: "An error occurred while fetching post details. Please try again later." },
            { status: 500 }
        );
    }
}
