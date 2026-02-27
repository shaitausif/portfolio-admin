import { User } from "@/app/src/models/user";
import ConnectDB from "@/app/src/lib/server/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "@/helpers/SendVerificationEmail";

export async function GET(req: NextRequest,{params}: {params: Promise<{email: string}>}){
    try {
        const { email: rawEmail } = await params
        const email = decodeURIComponent(rawEmail).toLowerCase().trim()

        if (!email) {
            return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
        }

        // Connect to the DB
        await ConnectDB()
        const user = await User.findOne({
            email
        })

        if(!user){
            return NextResponse.json({
                success : false, 
                message : "User not found"
            },{status : 404})
        }

        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        user.verifyCode = verificationCode
        user.VerifyCodeExpiry = new Date(Date.now() + 60 * 60 * 1000)
        await user.save({validateBeforeSave: false})

    const emailResponse = await sendVerificationEmail(user.email, "Admin", verificationCode)

        if(!emailResponse.success){
            return NextResponse.json({success : false, message : emailResponse.message},{status : 400})
        }

        return NextResponse.json({
            success : true ,
            email : user.email,
            message : "OTP Sent Successfully"
        },{status : 200})


    } catch (error) {
        const message = error instanceof Error ? error.message : "Internal server error"
        return NextResponse.json({success : false, message},{status : 500})
    }
}