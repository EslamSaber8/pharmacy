const mongoose = require("mongoose")
const validator = require("validator")
// Define the Product Schema
const productSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
            lowercase: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true, // Ensure a product has a valid category
        },
        imageCover: {
            type: String,
            required: false,
        },
        expDate: {
            type: String,
            required: false,
        },
        description: String,
        price: {
            type: Number,
            required: true,
        },
        pills: {
            type: Number,
        },
        sachets: { type: Number },
        stock: {
            type: Number,
            required: true,
        },
        sold: {
            type: Number,
            default: 0,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
)

const Product = mongoose.model("Product", productSchema)

module.exports = { Product }
