import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

// Register User

export const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, picturePath, friends, location } = req.body

        const salt = await bcrypt.genSalt()
        const passwordHash = await bcrypt.hash(password, salt)

        const newUser = new User({
            firstName,
            lastName,
            email,
            password: passwordHash,
            picturePath,
            friends,
            location,
            viewedProfile: Math.floor(Math.random() * 1000),
            impressions: Math.floor(Math.random() * 1000)
        })
        const saveUser = await newUser.save()
        res.status(201).json({ msg: "User created !", desc: saveUser })
    } catch (error) {
        res.status(500).json({ msg: "Can't create user !", desc: error.message })
    }
}

// Logging in

export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({
            where: {
                email: email
            }
        })
        if (!user) return res.status(400).json({ msg: "User doesn't exist !" })

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return res.status(400).json({ msg: "Invalid email or password !" })

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
        delete user.password
        const firstName = user.firstName
        const lastName = user.lastName
        const picturePath = user.picturePath
        const friends = user.friends
        const location = user.location
        const viewedProfile = user.viewedProfile
        const impressions = user.impressions
        res.status(200).json({ token, firstName, lastName, email, picturePath, friends, location, viewedProfile, impressions })
    } catch (error) {
        res.status(500).json({ msg: "Can't login to your account !", desc: error.message })
    }
}