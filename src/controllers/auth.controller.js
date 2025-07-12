import bcrypt from "bcryptjs"
import crypto from "crypto"

import { genereateToken } from "../lib/utils.js"
import User from "../routes/models/user.model.js"
import { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendResetSuccessEmail } from "../../mailtrap/emails.js"


export const signup = async (req, res) => {
    const {name, email, password} = req.body
    try {
        // Hashing password
        if(!name || !password || !email){
            res.status(400).json({message: "All fields are required"})
        }
        if(password.length < 6){
            res.status(400).json({message: "Password must be at least 6 characters"})
        }

        const user = await User.findOne({email})

        if(user) return res.status(400).json({message: "Email already exists"});

        const hashedPassword = await bcrypt.hash(password, 10)

        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString()

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            verificationToken: verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000,
        })
        await newUser.save()
        // Generate jwt token here
        genereateToken(newUser._id, res)

        await sendVerificationEmail(newUser.email, verificationToken)

        res.status(201).json({
            success: true,
            user: {
                ...newUser._doc,
                password: undefined
            }
        })
    } catch (error) {
        console.log("Eroror in signup controller: ", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const verifyEmail = async (req, res) => {
    const { code } = req.body
    try {
        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: {$gt: Date.now()}

        })
        if(!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired verification"
            })
        }
        user.isVerified = true
        user.verificationToken = undefined
        user.verificationTokenExpiresAt = undefined

        await user.save()
        await sendWelcomeEmail(user.email, user.name)
        res.status(200).json({
            success: true,
            message: "Verified email successfully",
            user: {
                ...user._doc,
                password: undefined
            }
        })
    } catch (error) {
        console.log("Error while verifying email: ", error)
        res.status(500).json({
            success: false,
            message: "Server error"
        })
    }
}

export const login = async (req, res) => {
    const {email, password} = req.body
    try {
        const user = await User.findOne({email})
        if(!user) return res.status(400).json({message: "Invalid Email"});
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect) return res.status(400).json({message: "Incorrect Password"});
        genereateToken(user._id, res)
        user.lastLogin = new Date()
        await user.save()
        res.status(200).json({
            _id: user._id,
            email: user.email,
            name: user.name,
            profilePic: user.profilePic
        })
    } catch (error) {
       console.log("Eroror in login controller: ", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const logout = (req, res) => {
    try {
    res.clearCookie("token")
    res.status(200).json({ message: "Logged out successfully"})
    } catch (error) {
        console.log("Eroror in logout controller: ", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}

export const forgotPassword = async (req, res) => {
    const {email} = req.body
    try {
        const user = await User.findOne({email})
        if(!user) return res.status(400).json({message: "User not found"});

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString("hex")
        const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000

        user.resetPasswordToken = resetToken
        user.resetPasswordExpiresAt = resetTokenExpiresAt

        await user.save()

        // send email
        await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`)
        res.status(200).json({
            success: true,
            message: "Password reset link sent to your email"
        })
    } catch (error) {
        console.log("Error in Forgot Password: ", error)
        res.status(400).json({
            success: false,
            message: error.message
        })
    }
}

export const resetPassword = async (req, res) => {
    try {
        const {token} = req.params
        console.log('token', token)
        const { password } = req.body
        console.log('password', password)

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpiresAt: {
                $gt: Date.now()
            }
        })

        if (!user) {
		    return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
		}

        const hashedPassword = await bcrypt.hash(password, 10)

        user.password = hashedPassword
        user.resetPasswordToken = undefined
        user.resetPasswordExpiresAt = undefined

        await user.save()

        await sendResetSuccessEmail(user.email)

        res.status(200).json({
            success: true,
            message: "Password reset successful"
        })
    } catch (error) {
        console.log("Error in resetPassword ", error);
		res.status(400).json({ success: false, message: error.message });
    }
}

export const checkAuth = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select("-password");
		if (!user) {
			return res.status(400).json({ success: false, message: "User not found" });
		}

		res.status(200).json({ success: true, user });
	} catch (error) {
		console.log("Error in checkAuth ", error);
		res.status(400).json({ success: false, message: error.message });
	}
};