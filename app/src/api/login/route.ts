import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import ConnectDB from "../../lib/server/dbConnect";
import { User } from "../../models/user";

export async function POST(req: NextRequest){
    try {
        const { email, password } = await req.json()
        if(!email?.trim() || !password?.trim()) {
            return NextResponse.json({success : false, message : 'Please provide your credentials', statusCode: 400}, { status: 400 })
        }

        await ConnectDB()

        const user = await User.findOne({email})
        if(!user) {
            return NextResponse.json({success : false, message : "User not found", statusCode: 404}, { status: 404 })
        }

        const isPasswordValid = await user.isPasswordCorrect(password)
        if(!isPasswordValid) {
            return NextResponse.json({success : false, message : "Incorrect Password", statusCode: 401}, { status: 401 })
        }

        const accessToken = user.generateAccessToken()

        const response = NextResponse.json({
            success: true,
            message: "Login successful",
            data: {
                _id: user._id,
                email: user.email,
            }
        }, { status: 200 })

        response.cookies.set("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 2 * 24 * 60 * 60, // 2 days
        })

        return response

    } catch (error: any) {
        console.error(error.message)
        return NextResponse.json({ success: false, message: "Something went wrong", statusCode: 500 }, { status: 500 })
    }
}