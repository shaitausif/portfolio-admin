import { NextResponse } from "next/server";
import { ApiResponse } from "../../utils/ApiResponse";

// DELETE — Logout: clear the accessToken cookie
export async function DELETE() {
  const response = NextResponse.json(
    new ApiResponse(200, null, "Logged out successfully"),
    { status: 200 }
  );

  response.cookies.set("accessToken", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0, // expire immediately
  });

  return response;
}
