import { genereateToken } from "../lib/utils.js"
import User from "../routes/models/user.model.js"
import bcrypt from "bcryptjs"
export const signup = async (req, res) => {
    const {fullName, email, password} = req.body
    try {
        // Hashing password
        if(!fullName || !password || !email){
            res.status(400).json({message: "All fields are required"})
        }
        if(password.length < 6){
            res.status(400).json({message: "Password must be at least 6 characters"})
        }

        const user = await User.findOne({email})

        if(user) return res.status(400).json({message: "Email already exists"});

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword
        })

        if(newUser){
            // Generate jwt token here
            genereateToken(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic
            })
        } else {
            res.status(400).json({message: "User not found"})

        }
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
            fullName: user.fullName,
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