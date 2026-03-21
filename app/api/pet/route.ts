import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.INTERNAL_API_URL || "http://localhost:8000";

// Whitelist of allowed query parameters
const ALLOWED_PARAMS = [
  'page',
  'per_page',
  'search',
  'age',
  'type_of_animal_id',
  'tag_personality_id'
] as const;

// Server-side pet service for API routes
const petService = {
  getPets: async (params: Record<string, string>) => {
    const queryParams = new URLSearchParams();
    
    // Build query string from params
    Object.entries(params).forEach(([key, value]) => {
      if (value && ALLOWED_PARAMS.includes(key as typeof ALLOWED_PARAMS[number])) {
        queryParams.set(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = `${API_URL}/api/v1/pets${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error [${response.status}]:`, errorText);
      throw new Error(`Failed to fetch pets: ${response.status}`);
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

    // Use petService to fetch data
    const data = await petService.getPets(params);
    return NextResponse.json(data);
    
  } catch (error) {
    // Log detailed error on server for debugging
    console.error('[API Route] Error:', error);
    
    // Return generic error message to client
    return NextResponse.json(
      { message: "An error occurred while fetching pets. Please try again later." }, 
      { status: 500 }
    );
  }
}