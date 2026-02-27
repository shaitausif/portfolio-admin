import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "../../lib/server/dbConnect";
import { User } from "../../models/user";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email?.trim() || !otp?.trim()) {
      return NextResponse.json(
        { success: false, message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    await ConnectDB();

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json(
        { success: false, message: "Account is already verified" },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (user.VerifyCodeExpiry && user.VerifyCodeExpiry < new Date()) {
      return NextResponse.json(
        { success: false, message: "OTP has expired. Please sign up again." },
        { status: 400 }
      );
    }

    // Check if OTP matches
    if (user.verifyCode !== otp.trim()) {
      return NextResponse.json(
        { success: false, message: "Invalid OTP" },
        { status: 400 }
      );
    }

    // Mark user as verified and clear OTP fields
    user.isVerified = true;
    user.verifyCode = undefined;
    user.VerifyCodeExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return NextResponse.json(
      { success: true, message: "Email verified successfully. You can now login." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Verify code error:", error.message);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
