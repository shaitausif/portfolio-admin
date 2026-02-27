import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "../../lib/server/dbConnect";
import { User } from "../../models/user";
import { sendVerificationEmail } from "@/helpers/SendVerificationEmail";
import { ApiError, handleApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password?.trim()) {
      throw new ApiError(400, "Email and password are required");
    }

    await ConnectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser && existingUser.isVerified) {
      throw new ApiError(409, "User already exists with this email");
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    if (existingUser && !existingUser.isVerified) {
      // User exists but is unverified — update password & resend OTP
      existingUser.password = password;
      existingUser.verifyCode = verificationCode;
      existingUser.VerifyCodeExpiry = verifyCodeExpiry;
      await existingUser.save();
    } else {
      // Create new user (role defaults to "User")
      await User.create({
        email: email.toLowerCase().trim(),
        password,
        verifyCode: verificationCode,
        VerifyCodeExpiry: verifyCodeExpiry,
        isVerified: false,
      });
    }

    // Send verification email
    const emailResponse = await sendVerificationEmail(
      email.toLowerCase().trim(),
      "User",
      verificationCode
    );

    if (!emailResponse.success) {
      throw new ApiError(500, emailResponse.message);
    }

    return NextResponse.json(
      new ApiResponse(201, null, "Account created. Verification OTP sent to your email."),
      { status: 201 }
    );
  } catch (error: unknown) {
    return handleApiError(error);
  }
}
