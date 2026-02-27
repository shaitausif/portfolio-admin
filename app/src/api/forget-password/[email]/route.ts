import { User } from "@/app/src/models/user";
import ConnectDB from "@/app/src/lib/server/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/helpers/SendVerificationEmail";
import { ApiError, handleApiError } from "@/app/src/utils/ApiError";
import { ApiResponse } from "@/app/src/utils/ApiResponse";

export async function GET(req: NextRequest,{params}: {params: Promise<{email: string}>}){
    try {
        const { email: rawEmail } = await params
        const email = decodeURIComponent(rawEmail).toLowerCase().trim()

        if (!email) {
            throw new ApiError(400, "Email is required")
        }

        // Connect to the DB
        await ConnectDB()
        const user = await User.findOne({
            email
        })

        if(!user){
            throw new ApiError(404, "User not found")
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verifyCode = verificationCode
        user.VerifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000)
        await user.save({validateBeforeSave: false})

    const emailResponse = await sendVerificationEmail(user.email, "Admin", verificationCode)

        if(!emailResponse.success){
            throw new ApiError(400, emailResponse.message)
        }

        return NextResponse.json(
            new ApiResponse(200, { email: user.email }, "OTP Sent Successfully"),
            { status: 200 }
        )


    } catch (error: unknown) {
        return handleApiError(error)
    }
}