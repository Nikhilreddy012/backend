import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js"
import { mailTrapClient, sender } from "./mailtrap.config.js"

export const sendVerificationEmail = async (email, token) => {
    const recepient = [{email}]

    try {
        const response = await mailTrapClient.send({
            from: sender,
            to: recepient,
            subject: "Verify Your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", token),
            category: "Email Verification" 
        })

        console.log("Email sent successfully", response)
    } catch (error) {
        console.error('Error sending verification email', error)
        throw new Error(`Error sending verification email: ${error}`)
    }
}