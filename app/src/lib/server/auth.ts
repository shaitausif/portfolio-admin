import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

/**
 * Extracts and verifies the authenticated user from the accessToken cookie.
 * Returns the decoded payload or null if invalid/missing.
 */
export function getAuthUser(req: NextRequest): { _id: string; email: string } | null {
  const token = req.cookies.get("accessToken")?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      _id: string;
      email: string;
    };
    return decoded;
  } catch {
    return null;
  }
}
