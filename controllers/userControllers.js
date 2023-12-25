const { User } = require("../models/userModel")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const projection = { password: 0, passwordConfirm: 0 }

    // Fetch users from the database, excluding specified fields
    const users = await User.find({}, projection)

    res.status(200).json(users)
})

exports.getUser = catchAsync(async (req, res, next) => {
    const idOrEmailOrPhone = req.params.id

    const projection = { password: 0, passwordConfirm: 0 }

    if (/^[0-9a-fA-F]{24}$/.test(idOrEmailOrPhone)) {
        // If it matches the ObjectId format, assume it's an _id
        const user = await User.findById(idOrEmailOrPhone, projection)

        if (!user) {
            return next(new AppError("User not found", 404))
        }

        return res.status(200).json(user)
    }

    // Fetch users from the database, excluding specified fields
    const users = await User.findOne(
        {
            $or: [{ email: idOrEmailOrPhone }, { phone: idOrEmailOrPhone }],
        },
        projection
    )

    if (!users) {
        return next(new AppError("User not found", 404))
    }

    res.status(200).json(users)
})

exports.updateProfile = catchAsync(async (req, res, next) => {
    const user = req.user
    const { username,phone } = req.body

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
            username,
            phone
        },
        { new: true, runValidators: true }
    )
    await updatedUser.save({ validateBeforeSave: false })
    res.status(200).json({
        status: "success",
        message: "Your Account has beed changed successfully",
        user: updatedUser,
    })
})

exports.changePassword = catchAsync(async (req, res, next) => {
    const user = req.user
    const { oldPassword, newPassword, newPasswordConfirm } = req.body

    if (oldPassword === newPassword || !newPasswordConfirm) {
        return next(new AppError("New password cannot match your current password or be empty", 401))
    } else if (newPassword !== newPasswordConfirm) {
        return next(new AppError("Passwords do not match", 401))
    }
    if (!user || !(await user.correctPassword(oldPassword, user.password))) {
        // instance method
        return next(new AppError("Incorrect password", 401)) //401
    }

    user.password = req.body.newPassword
    user.passwordConfirm = req.body.newPasswordConfirm
    await user.save()

    res.status(200).json({
        status: "success",
        message: "Your Account has beed changed successfully",
        user: user,
    })
})
