import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "../../lib/server/dbConnect";
import { User } from "../../models/user";
import { ApiError, handleApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email?.trim() || !otp?.trim()) {
      throw new ApiError(400, "Email and OTP are required");
    }

    await ConnectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    if (user.isVerified) {
      throw new ApiError(400, "Account is already verified");
    }

    // Check if OTP has expired
    if (user.VerifyCodeExpiry && user.VerifyCodeExpiry < new Date()) {
      throw new ApiError(400, "OTP has expired. Please sign up again.");
    }

    // Check if OTP matches
    if (user.verifyCode !== otp.trim()) {
      throw new ApiError(400, "Invalid OTP");
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.verifyCode = undefined;
    user.VerifyCodeExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return NextResponse.json(
      new ApiResponse(200, null, "Email verified successfully. You can now login."),
      { status: 200 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
