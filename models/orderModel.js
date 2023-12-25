const mongoose = require("mongoose")

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    products: [
        {
            productID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            quantity: {
                type: Number,
                default: 1,
            },
        },
    ],
    address: { type: String, required: [true, "Please provide an address"] },
    delivery:{
       type: mongoose.Schema.ObjectId,
       ref:"Delivery"
    },
    long: { type: Number, required: [true, "Please provide an location"] },
    lat: { type: Number, required: [true, "Please provide a location"] },
    totalPrice: Number,
    state: {
        type: String,
        enum: ["pending", "shipped", "delivered", "canceled"],
        default: "pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

orderSchema.pre(/^find/, function (next) {
    this.populate({
        path: "products.productID",
        select: "title price imageCover",
    })
    next()
})
orderSchema.pre(/^find/, function (next) {
    this.populate({
        path: "userId",
        select: "username phone",
    })
    next()
})
orderSchema.pre(/^find/, function (next) {
    this.populate({
        path: "Delivery",
        select: "name phone",
    })
    next()
})

const Order = mongoose.model("Order", orderSchema)

module.exports = Order
