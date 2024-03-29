const jwt = require("jsonwebtoken")
const AppError = require("../utils/appError")
const { User } = require("../models/userModel")

exports.auth = async (req, res, next) => {
    const authorization = req.header("authorization")
    if (!authorization) {
        return next(new AppError("Access Denied", 404))
    }

    const [bearer, token] = authorization.split(" ")
    if (bearer !== "Bearer" || !token) {
        return next(new AppError("Token Invalid", 401))
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(payload.id).select("+password")

        if (!user) {
            return next(new AppError("User not found", 401))
        }

        req.user = user
        next()
    } catch (error) {
        // Handle the JWT verification error and provide a specific error message
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError("JWT Verification Error: " + error.message, 401))
        } else {
            // Handle other types of errors, such as Token Expired
            return next(new AppError("Token Invalid: " + error.message, 401))
        }
    }
}

exports.allowTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError("You are not authorized to perform this action", 403))
        }
        next()
    }
}
