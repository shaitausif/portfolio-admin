import { NextRequest, NextResponse } from "next/server";
import ConnectDB from "../../lib/server/dbConnect";
import { User } from "../../models/user";
import { sendVerificationEmail } from "@/helpers/SendVerificationEmail";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    await ConnectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });

    if (existingUser && existingUser.isVerified) {
      return NextResponse.json(
        { success: false, message: "User already exists with this email" },
        { status: 409 }
      );
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
      return NextResponse.json(
        { success: false, message: emailResponse.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account created. Verification OTP sent to your email.",
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Signup error:", error.message);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
}
