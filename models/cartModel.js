const mongoose = require("mongoose")

const cartSchema = new mongoose.Schema({
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
    totalPrice: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})
cartSchema.pre(/^find/, function (next) {
    this.populate({
        path: "products.productID",
        select: "title price imageCover",
    })
    next()
})


cartSchema.methods.addProductQuantity = function (productId) {
    const productIndex = this.products.findIndex((product) => product.productID.equals(productId))

    if (productIndex !== -1) {
        this.products[productIndex].quantity += 1
    }

    return this.save()
}

cartSchema.methods.removeProductQuantity = function (productId) {
    const productIndex = this.products.findIndex((product) => product.productID.equals(productId))

    if (productIndex !== -1) {
        if (this.products[productIndex].quantity > 1) {
            this.products[productIndex].quantity -= 1
        }
    }

    return this.save()
}

// Define the User Schema
module.exports = mongoose.model("Cart", cartSchema)
