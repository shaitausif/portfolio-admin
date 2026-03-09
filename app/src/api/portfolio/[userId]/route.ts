import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "../../../lib/server/dbConnect";
import { Profile } from "../../../models/profile";
// Import models so Mongoose registers them before populate()
import "../../../models/skill";
import "../../../models/project";
import "../../../models/experience";
import "../../../models/education";
import { ApiResponse } from "../../../utils/ApiResponse";
import { ApiError, handleApiError } from "../../../utils/ApiError";

// PUBLIC endpoint — no authentication required
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    if (!userId) throw new ApiError(400, "User ID is required");

    await ConnectDB();

    const profile = await Profile.findOne({ userId })
      .populate("skills")
      .populate("projects")
      .populate("experience")
      .populate("education")
      .lean();

    if (!profile) throw new ApiError(404, "Portfolio not found");

    return NextResponse.json(
      new ApiResponse(200, profile, "Portfolio fetched successfully"),
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
