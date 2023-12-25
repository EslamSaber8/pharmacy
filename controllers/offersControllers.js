const Offers = require("../models/offersModel")
const catchAsync = require("../utils/catchAsync")

// Create a new offer

exports.createOffer = catchAsync(async (req, res, next) => {
    const newOffer = await Offers.create(req.body)
    res.status(201).json(newOffer)
})

// Get all offers
exports.getOffers = catchAsync(async (req, res, next) => {
    const offers = await Offers.find()
    res.status(200).json(offers)
})

// Update an offer
exports.updateOffer = catchAsync(async (req, res, next) => {
    const { id } = req.params

    const updatedOffer = await Offers.findByIdAndUpdate(id, req.body, { new: true })
    res.status(200).json(updatedOffer)
})

// Delete an offer
exports.deleteOffer = catchAsync(async (req, res, next) => {
    const { id } = req.params
    const deletedOffer = await Offers.findByIdAndRemove(id)
    res.status(200).json(deletedOffer)
})
