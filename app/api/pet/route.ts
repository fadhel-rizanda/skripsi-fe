import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.API_URL  || "http://localhost:8000"

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
      const errorText = await phpRes.text();
      let errorData;
      
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { 
          message: `Backend error: ${phpRes.status} ${phpRes.statusText}`,
          error: errorText 
        };
      }
      
      return NextResponse.json(errorData, { status: phpRes.status });
    }

    const data = await phpRes.json();
    return NextResponse.json(data, { status: phpRes.status });
    
  } catch (error) {
    console.error('[API Route] Error:', error);
    
    return NextResponse.json(
      { 
        message: "Failed to fetch pets from backend",
        error: error instanceof Error ? error.message : String(error)
      }, 
      { status: 500 }
    );
  }
}