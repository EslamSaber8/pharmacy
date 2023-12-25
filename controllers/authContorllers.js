const express = require("express")
const { User } = require("../models/userModel") // Adjust the path as needed
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const bodyParser = require("body-parser")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
const sendEmail = require("../config/twillio")

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    })
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id)
    res.cookie("token", token, {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        // secure: true,
        httpOnly: true,
    })
    user.password = undefined
    res.status(statusCode).json({
        status: "success",
        message: "User registered successfully",
        token,
        user,
    })
}

const sendOtp = async (user) => {
    // Generate and set the OTP
    user.otp = user.createOTP()
    try {
        // Compose the email message
        const message = `<div class="container">
        <h2>Your One-Time Verification Code</h2>
        <p>Dear ${user.username},</p>
        <p>
            Thank you for choosing Pharmazone. We're thrilled to have you on board! To ensure the security of your account, please complete the
            verification process by entering the following one-time verification code:
        </p>
        <p><strong>Verification Code:</strong> ${user.otp}</p>
        <p><strong>Note:</strong> Please enter this code within the next 10 minutes.</p>
        <p>If you didn't request this code or have any concerns, please contact our support team immediately.</p>
        <p>Thank you for your cooperation.</p>
        <p>Best regards,</p>
        <p><strong>[Pharmazone]</strong></p>
    </div>`
        // Send the email
        await sendEmail({
            email: user.email,
            subject: `Your One-Time Verification Code`,
            message,
        })
        // Log a success message
    } catch (err) {
        // Handle any errors
        console.error("Error in sendOtp:", err)
    }
}
const sendPassword = async (user) => {
    // Generate and set the OTP
    user.passwordResetToken = user.createPasswordResetToken()
    try {
        // Save the user without validation (if needed)

        // Compose the email message
        const message = `<div class="container">
        <h2>Password Reset Code</h2>
        <p>Dear ${user.username},</p>
        <p>
            We received a request to reset your Pharmazone account password. To proceed with the password reset, please enter the following one-time verification code:
        </p>
        <p><strong>Verification Code:</strong> ${user.passwordResetToken}</p>
        <p><strong>Note:</strong> Please use this code within the next 10 minutes to ensure the security of your account.</p>
        <p>If you didn't request this code or have any concerns, please contact our support team immediately.</p>
        <p>Thank you for your cooperation.</p>
        <p>Best regards,</p>
        <p><strong>[Pharmazone]</strong></p>
    </div>`

        // Send the email
        await sendEmail({
            email: user.email,
            subject: `Password Reset Code`,
            message,
        })
        // Log a success message
    } catch (err) {
        // Handle any errors
        console.error("Error in forget password code:", err)
    }
}

exports.signup = catchAsync(async (req, res, next) => {
    const { username, password, email, passwordConfirm, phone } = req.body

    // Check if the username or email already exists
    const existingUser = await User.findOne({ email })
    const existingPhone = await User.findOne({ phone })
    if (existingUser) {
        return next(new AppError("Email already exists", 500))
    }
    if (existingPhone) {
        return next(new AppError("This phone number already exists", 500))
    }

    const avatar = `https://pharmacy.pildextech.cf/uploads/avatar/${Math.floor(Math.random() * (4 - 1 + 1) + 1)}.png`

    const newUser = new User({
        username,
        password, // Use the hashed password
        email,
        avatar,
        phone,
        passwordConfirm,
    })
    sendOtp(newUser)
    await newUser.save()

    createSendToken(newUser, 200, res)
})

exports.signin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body

    // Find the user by email
    const user = await User.findOne({ email }).select("+password")

    // Check if user or password is undefined
    if (!user || !password) {
        console.error("Invalid user or password:", user, password)
        return next(new AppError("Invalid email or password", 401))
    }

    // Compare the provided password with the hashed password
    if (!user || !(await user.correctPassword(password, user.password))) {
        // instance method
        return next(new AppError("Incorrect email or password", 401)) //401
    }

    createSendToken(user, 200, res)
})

exports.verify = async (req, res, next) => {
    const { email, otpCode } = req.body

    const user = await User.findOne({ email })
    if (user.verified === true) {
        return next(new AppError("Your account has been verified already.", 500))
    }
    if (otpCode === user.otp) {
        user.verified = true
        user.otp = undefined
        await user.save({ validateBeforeSave: false })
        res.status(200).json({
            status: "success",
            message: "Your account has been verified",
        })
    }
}
exports.reSendverify = async (req, res, next) => {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (user.verified === true) {
        return next(new AppError("Your account has been verified already.", 500))
    }
    sendOtp(user)
    res.status(200).json({
        status: "success",
        message: "The new code has been sent",
    })
}

exports.forgetPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body

    const user = await User.findOne({ email })

    if (!user) {
        return res.status(200).json({
            status: "success",
            message: "If you provided a valid email, message sent to your mail",
        })
    }
    sendPassword(user)
    await user.save({ validateBeforeSave: false })
    res.status(200).json({
        status: "success",
        message: "If you provided a valid email, message sent to your mail",
        forgetCode: user.passwordResetToken,
    })
})

exports.forgetPasswordConfirm = catchAsync(async (req, res, next) => {
    const { email, password, passwordConfirm, forgetCode } = req.body

    const user = await User.findOne({ email })

    if (!user) {
        return next(new AppError("Email dose not found", 404))
    }
    if (forgetCode != user.passwordResetToken) {
        return next(new AppError("Invalid token", 403))
    }

    if (!user.passwordResetExpires) {
        return next(new AppError("Invalid or expired token", 400))
    }

    if (Date.now() > user.passwordResetExpires) {
        user.passwordResetExpires = null
        await user.save({ validateBeforeSave: false })
        return next(new AppError("Invalid or expired token", 400))
    }
    if (password.length < 8) {
        return next(new AppError("Passwords too short", 400))
    }
    if (password !== passwordConfirm) {
        return next(new AppError("Passwords do not match", 400))
    }

    user.password = password
    user.passwordResetExpires = null
    await user.save({ validateBeforeSave: false })
    res.status(201).json({
        status: "success",
        message: "Your password has been updated successfully",
    })
})


