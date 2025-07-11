import { genereateToken } from "../lib/utils.js"
import User from "../routes/models/user.model.js"
import { sendVerificationEmail } from "../../mailtrap/emails.js"
import bcrypt from "bcryptjs"
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

export const login = async (req, res) => {
    const {email, password} = req.body
    try {
        const user = await User.findOne({email})
        if(!user) return res.status(400).json({message: "Invalid Email"});
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if(!isPasswordCorrect) return res.status(400).json({message: "Incorrect Password"});
        genereateToken(user._id, res)
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
    res.cookie('jwt', "", {
        maxAge: 0
    })
    res.status(200).json({ message: "Logged out successfully"})
    } catch (error) {
        console.log("Eroror in logout controller: ", error.message)
        res.status(500).json({message: "Internal Server Error"})
    }
}