import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const cookie = request.cookies.get("admin_auth");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || cookie?.value !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
