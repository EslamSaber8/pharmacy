const cartModel = require("../models/cartModel")
const Order = require("../models/orderModel")
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")

exports.placeOrder = catchAsync(async (req, res) => {
    const cartId = req.params.cartId
    const user = req.user
    const { address, long, lat } = req.body
    const cart = await cartModel.findById(cartId)
    if (!cart || cart.products.length <= 0) {
        return next(new AppError("No orders", 404))
    }

    const order = new Order({
        products: cart.products,
        userId: user._id,
        address,
        totalPrice: cart.totalPrice,
        long,
        lat, // You can set the initial state here
    })
    await order.save()

    cart.products = []
    cart.totalPrice = 0
    await cart.save()
    res.status(201).json({ order })
})

exports.getOrder = catchAsync(async (req, res, next) => {
    const user = req.user
    const order = await Order.find({ userId: user._id })

    if (!order || order.length <= 0) {
        return next(new AppError("No orders", 404))
    }
    res.status(200).json({ order })
})

exports.getAllOrder = catchAsync(async (req, res, next) => {
    const order = await Order.find()
    if (!order || order.length <= 0) {
        return next(new AppError("No orders", 404))
    }
    res.status(200).json({ order })
})



exports.updateOrder = catchAsync(async (req, res, next) => {
    const { state,deliveryID } = req.body
    const order = await Order.findById(req.params.id)

    if (!order) {
        return next(new AppError("No order found", 404))
    }

    order.state = state
    order.delivery=deliveryID;
    await order.save()

    res.status(200).json({ order })
})

exports.deleteOrder = catchAsync(async (req, res, next) => {
    const user = req.user
    const order = await Order.findByIdAndDelete(req.params.id) 

    if (!order) {
        return next(new AppError("No order found", 404))
    }

    res.status(204).json()
})