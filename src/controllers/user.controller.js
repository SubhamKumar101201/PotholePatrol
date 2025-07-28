import { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import asyncHandler from "../utils/asyncHandler.js"


// for secure cookies
const options = {
    httpOnly: true,
    secure: true
}

// create access and refresh token
const generateAccessAndRefreshToken = async (userId) => {
    try {

        const user = await User.findById(userId)

        if (!user) {
            throw new ApiError(404, "User not found while generate access and refresh token")
        }

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        console.error("Error while generate access and refresh token: ", error)
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

// register controller

const registerUser = asyncHandler(async (req, res) => {

    const { name, email, password, role } = req.body

    if (!name?.trim() || !email?.trim() || !password?.trim() || !role?.trim()) {
        throw new ApiError(400, "Please provide all fields")
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
        throw new ApiError(409, "User with email already exists")
    }

    const user = await User.create({
        name,
        email,
        password,
        role
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Failed to create user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )

})

// login controller

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!(email || password)) {
        throw new ApiError(400, "Please provide all fields")
    }

    const user = await User.findOne({ email })

    if (!user) {
        throw new ApiError(404, "User doesn't exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, {
                user: loggedInUser, accessToken, refreshToken
            }, "User logged in successfully")
        )

})

// logout controller

const logoutUser = asyncHandler(async (req, res) => {
    const userId = req.user._id

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id")
    }

    await User.findByIdAndUpdate(
        userId,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))

})


const updateUserDetails = asyncHandler(async (req, res) => {

    const { name } = req.body

    if (!name?.trim()) {
        throw new ApiError(400, "Please provide all fields")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                name: name.trim()
            }
        },
        { new: true }
    ).select("-password -refreshtoken")

    if (!user) {
        throw new ApiError(500, "Failed to update user details")
    }

    return res.status(200)
        .json(
            new ApiResponse(200, user, "User details updated successfully")
        )

})

const forgetPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    if (!(oldPassword && newPassword)) {
        throw new ApiError(400, "All fields are required")
    }

    if (oldPassword === newPassword) {
        throw new ApiError(400, "Old password and New password cannot be same")
    }

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(401, "Invalid user")
    }

    const isPasswordValid = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid Password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"))

})

/*
 users {
  id integer pk
  name string
  email string
  password string
  profileImage string
  refreshToken string
  createdAt date
  updatedAt date
}
*/

const getCurrentUser = asyncHandler(async (req, res) => {
    // for fetching current user details
    return res.status(200)
        .json(new ApiResponse(200, req.user, "current user fetched successfully"))
})

// refresh access token controller

const refreshAccessToken = asyncHandler( async (req,res) => {

    const incomingRefreshToken  = req.cookies?.refreshToken || req.body?.refreshToken // get the refresh token from cookies or from body

    if ( !incomingRefreshToken ) {
        throw new ApiError(401, "Unauthorized request")
    }
    
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id) // get the user from decoded refresh token 

    if ( !user ) {
        throw new ApiError(401, "Invalid refresh token")
    }

    if ( incomingRefreshToken !== user?.refreshToken ) {
        throw new ApiError(401, "Refresh token is expired or used")
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

    return  res.status(200)
                .cookie("accessToken", accessToken, options)
                .cookie("refreshToken", newRefreshToken, options)
                .json(
                    new ApiResponse(200, {
                        accessToken, newRefreshToken
                    }, "Access token refreshed successfully")
                )

})


export {
    getCurrentUser, 
    updateUserDetails,  
    loginUser, 
    logoutUser, 
    forgetPassword,
    refreshAccessToken, 
    registerUser
}