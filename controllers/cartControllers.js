const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError")
const Cart = require("../models/cartModel")

const calcTotalCartPrice = (cart) => {
    let totalPrice = 0
    cart.products.forEach((item) => {
        totalPrice += item.quantity * parseFloat(item.productID["price"])
    })
    cart.totalPrice = totalPrice
    return totalPrice
}

exports.placeCart = catchAsync(async (req, res, next) => {
    const { products } = req.body
    const userId = req.user._id
    if (!products) {
        return next(new AppError("User, products, are required fields", 400))
    }

    let cart = await Cart.findOne({ userId })

    if (!cart) {
        // create cart for logged student with course
        cart = await Cart.create({
            userId,
            products: [],
        })
    }

    console.log(cart)
    for (let index = 0; index < cart.products.length; index++) {
        if (cart.products[index].productID["_id"].toString() === products.productID.toString()) {
            cart.products[index].quantity += 1
            calcTotalCartPrice(cart)
            await cart.save()
            return res.status(201).json({ message: "Order placed successfully", order: cart })
        }
    }

    cart.products.push(products)
    await cart.save()
    cart = await Cart.findOne({ userId })
    calcTotalCartPrice(cart)
    await cart.save()
    return res.status(201).json({ message: "Order placed successfully", order: cart })
})

exports.getAllOrders = catchAsync(async (req, res, next) => {
    const userId = req.user._id

    const cart = await Cart.findOne({ userId })
    if (cart.length === 0) {
        return next(new AppError("There is no Orders", 404))
    }

    res.status(201).json({ cart })
})

exports.editQuantityAdd = catchAsync(async (req, res, next) => {
    const productId = req.params.productId
    const userId = req.user._id
    const cart = await Cart.findOne({ userId })
    if (!cart) {
        // create cart for logged student with course
        cart = await Cart.create({
            userId,
            products: [],
        })
    }

    if (req.user._id != cart.userId.toString()) {
        return next(new AppError("Premission Error", 404))
    }

    if (!cart || cart.length === 0) {
        return next(new AppError("Order not found", 404))
    }
    await cart.addProductQuantity(productId)
    calcTotalCartPrice(cart)
    await cart.save()
    res.status(200).json({ cart })
})

exports.editQuantityMinus = catchAsync(async (req, res, next) => {
    const productId = req.params.productId
    const userId = req.user._id
    const cart = await Cart.findOne({ userId })
    if (!cart) {
        // create cart for logged student with course
        cart = await Cart.create({
            userId,
            products: [],
        })
    }

    if (req.user._id != cart.userId.toString()) {
        return next(new AppError("Premission Error", 404))
    }
    if (!cart || cart.length === 0) {
        return next(new AppError("Order not found", 404))
    }
    await cart.removeProductQuantity(productId)
    calcTotalCartPrice(cart)
    await cart.save()
    res.status(200).json({ cart })
})

exports.deleteItem = catchAsync(async (req, res, next) => {
    const userId = req.user._id
    const productId = req.params.productId
    const cart = await Cart.findOne({ userId })
    cart.products = cart.products.filter((productID) => productID.productID._id.toString() !== productId)
    calcTotalCartPrice(cart)
    await cart.save()
    return res.json({ message: "Item removed from the cart successfully", cart })
})
