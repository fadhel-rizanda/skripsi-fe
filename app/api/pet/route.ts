import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Whitelist of allowed query parameters
const ALLOWED_PARAMS = [
  'page',
  'limit',
  'search',
  'age',
  'type_of_animal_id',
  'tag_personality_id'
] as const;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Filter and validate query parameters
    const validParams = new URLSearchParams();
    ALLOWED_PARAMS.forEach((param) => {
      const value = searchParams.get(param);
      if (value) {
        validParams.set(param, value);
      }
    });

    const queryString = validParams.toString();
    const url = `${API_URL}/api/v1/pets${queryString ? `?${queryString}` : ''}`;

    // Forward only whitelisted params to backend PHP API
    const phpRes = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
    });

    // Handle non-OK responses
    if (!phpRes.ok) {
      // Log the detailed error on the server for debugging
      const errorText = await phpRes.text();
      console.error(`Backend error [${phpRes.status}]:`, errorText);

      // Return a generic error message to the client
      return NextResponse.json({
        message: "An error occurred while fetching data from the backend.",
        status: phpRes.status
      }, { status: phpRes.status });
    }

    const data = await phpRes.json();
    return NextResponse.json(data, { status: phpRes.status });
    
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