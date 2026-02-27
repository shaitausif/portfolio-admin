import { NextResponse, NextRequest } from "next/server";
import ConnectDB from "../../lib/server/dbConnect";
import { User } from "../../models/user";
import { ApiError, handleApiError } from "../../utils/ApiError";
import { ApiResponse } from "../../utils/ApiResponse";

export async function POST(req: NextRequest){
    try {
        const { email, password } = await req.json()
        if(!email?.trim() || !password?.trim()) {
            throw new ApiError(400, "Please provide your credentials")
        }

        await ConnectDB()

        const user = await User.findOne({email})
        if(!user) {
            throw new ApiError(404, "User not found")
        }

        const isPasswordValid = await user.isPasswordCorrect(password)
        if(!isPasswordValid) {
            throw new ApiError(401, "Incorrect Password")
        }

        const accessToken = user.generateAccessToken()

        const response = NextResponse.json(
            new ApiResponse(200, { _id: user._id, email: user.email }, "Login successful"),
            { status: 200 }
        )

        response.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 2 * 24 * 60 * 60, // 2 days
        })

        return response

    } catch (error: unknown) {
        return handleApiError(error)
    }
}