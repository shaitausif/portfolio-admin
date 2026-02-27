import {resend} from "@/app/src/lib/server/resend"
import VerificationEmail from "@/emails/VerificationEmail";
import { render } from "@react-email/render";


// Here, in this file we're sending verification email to the respective email address with exception handling
// Emails are always asynchronous
export async function sendVerificationEmail(
    email : string,
    username : string,
    verificationCode : string
) {
    try {
        const emailHtml = await render(VerificationEmail({username, otp : verificationCode}));

        await resend.emails.send({
            from: 'Admin <onboarding@resend.dev>',
            to: email,
            subject: 'Portfolio Admin | Email Verification',
            html: emailHtml,
          });

        return {success : true, message : 'Verification Email sent successfully.'}
    } catch (emailError) {
        console.error('Email sending error:',emailError)
        return {success : false, message : 'Failed to send Verification email'}
    }
}