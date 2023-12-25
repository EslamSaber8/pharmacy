const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcrypt")

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please tell us your name"],
        minlength: 8,
    },
    email: {
        type: String,
        required: [true, "Please provide an email"],
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please provide a valid password"],
        minlength: 8,
        select: false,
    },
    phone: {
        type: String,
        required: [true, "Please provide a valid Phone Number"],
        minlength: 11,
        unique: true,
        match: /^01[0125][0-9]{8}$/,
    },
    verified: {
        type: Boolean,
        default: false,
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: function (el) {
                return el === this.password
            },
            message: "Passwords do not match",
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    avatar: {
        type: String,
    },
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer",
    },
    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
    ],
    otp: {
        type: String,
    },

    otpExpires: {
        type: Date,
    },
    wishlist: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "Product",
        },
    ],
})

userSchema.pre("save", async function (next) {
    // Only hash the password if it's modified (or new) and it exists
    if (!this.isModified("password") || !this.password) {
        return next()
    }

    // Hash the password
    this.password = await bcrypt.hash(this.password, 10)

    // Temporarily save the plain password for validation
    this.tempPassword = this.passwordConfirm

    this.passwordConfirm = undefined

    // Continue with the save operation
    next()
})

userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next()

    this.passwordChangedAt = Date.now() - 1

    next()
})

userSchema.methods.correctPassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.createOTP = function () {
    const secret = Math.floor(1000 + Math.random() * 9000).toString()

    this.otp = secret
    this.otpExpires = Date.now() + 10 * 60 * 1000

    // Return the plain (unhashed) OTP to send in the email
    return secret
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    //JWTTimestamp is when the token is issued
    //this refere to current document
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
        // console.log(changedTimestamp, JWTTimestamp);
        return JWTTimestamp < changedTimestamp
    }
    //false means that password not changed
    return false
}

userSchema.methods.createPasswordResetToken = function () {
    const secret = Math.floor(1000 + Math.random() * 9000).toString()

    this.passwordResetToken = secret
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000

    return secret
}
const User = mongoose.model("User", userSchema)

module.exports = { User }
