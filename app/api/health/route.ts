import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "flashstudy-ai",
    timestamp: new Date().toISOString(),
  });
}
