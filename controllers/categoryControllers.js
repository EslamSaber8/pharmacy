const Category = require("../models/categoryModel")
const catchAsync = require("../utils/catchAsync")

exports.createOneCAT = catchAsync(async (req, res, next) => {
    const { name } = req.body
    const category = new Category({ name, imageCover: req.body.imageCover })
    await category.save()
    res.status(201).json(category)
})

exports.getAllCAT = catchAsync(async (req, res) => {
    const categories = await Category.find()
    res.status(200).json({ message: "success", categories: categories })
})

exports.editOneCAT = catchAsync(async (req, res) => {
    const { name, image } = req.body
    const category = await Category.findByIdAndUpdate(req.params.id, { name, image }, { new: true })
    res.status(200).json(category)
})

exports.deleteCAT = catchAsync(async (req, res) => {
    await Category.findByIdAndDelete(req.params.id)
    res.status(204).send() // No content response
})
