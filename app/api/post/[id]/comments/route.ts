import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// GET comments for a post
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const postId = params.id;
        const url = `${API_URL}/v1/posts/${postId}/comments`;

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend error [${response.status}]:`, errorText);
            throw new Error(`Failed to fetch comments: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('[API Route] Error:', error);

        return NextResponse.json(
            { message: "An error occurred while fetching comments. Please try again later." },
            { status: 500 }
        );
    }
}

// POST create a comment
export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const postId = params.id;
        const body = await req.json();
        const url = `${API_URL}/v1/posts/${postId}/comments`;

        // Get auth token from request headers
        const authHeader = req.headers.get('authorization');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(authHeader && { 'Authorization': authHeader }),
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Backend error [${response.status}]:`, errorText);

            if (response.status === 401) {
                return NextResponse.json(
                    { message: "Unauthorized. Please login." },
                    { status: 401 }
                );
            }

            throw new Error(`Failed to create comment: ${response.status}`);
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error) {
        console.error('[API Route] Error:', error);

        return NextResponse.json(
            { message: "An error occurred while creating comment. Please try again later." },
            { status: 500 }
        );
    }
}
