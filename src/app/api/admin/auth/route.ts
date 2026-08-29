import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  adminSessionToken,
  checkAdminPassword,
} from "@/lib/admin/auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    const token = adminSessionToken();
    if (!token) {
      return NextResponse.json(
        { error: "ADMIN_PASSWORD가 설정되지 않았습니다" },
        { status: 500 }
      );
    }

    if (!checkAdminPassword(password)) {
      return NextResponse.json(
        { error: "비밀번호가 틀렸습니다" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });
    // 쿠키에는 비밀번호 원문이 아니라 파생 토큰을 저장한다.
    response.cookies.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ADMIN_COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }
}
