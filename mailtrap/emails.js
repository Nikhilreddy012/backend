import { PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE, VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js"
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

export const sendPasswordResetEmail = async (email, resetURL) => {
    const recepient = [{email}]

    try {
        const response = await mailTrapClient.send({
            from: sender,
            to: recepient,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password Reset"
        })

    } catch (error) {
        console.error(`Error sending password reset email`, error)

        throw new Error(`Error sending password reset email: ${error}`)
    }
}

export const sendResetSuccessEmail = async (email) => {
    const recepient = [{email}]

    try {
        const response = await mailTrapClient.send({
            from: sender,
            to: recepient,
            subject: "Password reset successfully",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password reset"
        })

        console.log("Password reset email sent successfully", response);
    } catch (error) {
        console.error(`Error sending password reset success email`, error)

        throw new Error(`Error sending password reset success email: ${error}`)
    }
}