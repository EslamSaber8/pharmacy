const express = require("express")
const { Delivery } = require("../models/deliveryModel") 
const AppError = require("../utils/appError")
const catchAsync = require("../utils/catchAsync")
exports.createDelivery = catchAsync(async (req, res, next) => {
    const { name, phone,password } = req.body
    const newDelivery = new Delivery({
         name, phone,password 
    })

    await newDelivery.save()

    res.status(201).json({ message: "Delivery created successfully", delivery: newDelivery })
})

exports.getDelivery = catchAsync(async (req, res, next) => {
    const delivery = await Delivery.findById(req.params.id)
        if (!delivery) {
            return next(new AppError("delivery not found", 404))
        }
        return res.status(200).json({ delivery })
})

exports.getAllDeliveries = catchAsync(async (req, res, next) => {

    const delivery = await Delivery.find();
    if(!delivery){
        return next(new AppError("No delivery ", 404))
    }
    res.status(200).json({ delivery })

})
exports.editDelivery = catchAsync(async (req, res, next) => {
    const {name,phone,password} = req.body
    const deliveryId = req.params.id

    // Check if the category exists
    const existingCategory = await Delivery.findById(deliveryId)
    if (!existingCategory) {
        return next(new AppError("Invalid delivery ID", 400))
    }

    const updatedDelivery = await DeliveryId.findByIdAndUpdate(
        deliveryId,
        {
            name,phone,password
        },
        { new: true }
    )

    if (!updatedDelivery) {
        return next(new AppError("Delivery not found", 404))
    }

    res.status(200).json({ message: "Delivery updated successfully", delivery:updatedDelivery })
})

exports.deleteDelivery= catchAsync(async (req, res, next) => {
    const deliveryId = req.params.id
    const deletedDelivery= await Delivery.findByIdAndDelete(deliveryId )

    if (!deletedDelivery) {
        return next(new AppError("Delivery not found", 404))
    }

    res.status(204).json() 
})
