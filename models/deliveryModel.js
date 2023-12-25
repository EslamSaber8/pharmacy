const mongoose = require("mongoose")


const deliverySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name"],
        minlength: 8,
    },
    phone: {
        type: String,
        required: [true, "Please provide a valid Phone Number"],
        minlength: 11,
        unique: true,
        match: /^01[0125][0-9]{8}$/,
    },
    password: {
        type: String,
        required: [true, "Please provide a valid password"],
        minlength: 8,
    },
})
const Delivery = mongoose.model("Delivery", userSchema)

module.exports = { Delivery }
