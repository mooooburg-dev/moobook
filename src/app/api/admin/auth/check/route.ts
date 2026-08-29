import { NextResponse } from "next/server";

import { verifyAdmin } from "@/lib/admin/auth";

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true });
}
