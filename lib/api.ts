import { NextResponse } from "next/server";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonServerError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}
