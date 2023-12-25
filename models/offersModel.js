const mongoose = require("mongoose")
// 1- Create Schema
const offerSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Offers title required"],
        },
        // A and B => shopping.com/a-and-b
        slug: {
            type: String,
            lowercase: true,
        },
        percent: { type: Number },
        productID: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        color: [{ type: String }],
        description: String,
        imageCover: String,
    },
    { timestamps: true }
)

// 2- Create model
const Offers = mongoose.model("Offers", offerSchema)

module.exports = Offers
