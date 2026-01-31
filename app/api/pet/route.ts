import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const params = searchParams.toString();

  // Forward semua query param ke API PHP
  const phpRes = await fetch(`${API_URL}/api/v1/pets?${params}`);
  const data = await phpRes.json();

  return NextResponse.json(data, { status: phpRes.status });
}