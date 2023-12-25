const express = require("express")
const { User } = require("../models/userModel") // Adjust the path as needed
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const bodyParser = require("body-parser")
const AppError = require("../utils/appError")
const multer = require("multer")
const catchAsync = require("../utils/catchAsync")
const Category = require("../models/categoryModel")
const { Product } = require("../models/productModel")

const domainName = "https://pharmacy.pildextech.cf/"

const imageToken = (imageCover) => {
    if (imageCover) {
        const photoPath = imageCover.replace(domainName, "") // Remove the domain name from the path
        fs.unlink(photoPath, (unlinkErr) => {
            if (unlinkErr) {
                console.error("Error deleting product photo:", unlinkErr)
            }
        })
    }
}

exports.createOne = catchAsync(async (req, res, next) => {
    const { title, slug, category, imageCover, expDate, price, stock, sold, description } = req.body

    // Check if the category exists
    const existingCategory = await Category.findById(category)
    if (!existingCategory) {
        // imageToken(imageCover)
        return next(new AppError("Invalid category ID", 400))
    }

    const newProduct = new Product({
        title,
        slug,
        category,
        imageCover: req.body.imageCover,
        expDate,
        price,
        stock,
        sold,
        description,
        // ... (other fields)
    })

    await newProduct.save()

    res.status(201).json({ message: "Product created successfully", product: newProduct })
})

exports.getOne = catchAsync(async (req, res, next) => {
    const product = await Product.findById(req.params.id).populate("category", "name")
    if (req.body.userId === "") {
        if (!product) {
            return next(new AppError("Product not found", 404))
        }
        return res.status(200).json({ product, isInFavorites: false })
    }
    const user = await User.findById(req.body.userId)

    if (user) {
        const isInFavorites = user.wishlist.some((wishlistProduct) => wishlistProduct.toString() === product._id.toString())
        return res.status(200).json({ product, isInFavorites })
    }
    return res.status(200).json({ product, isInFavorites: false })
})

// exports.getAll = catchAsync(async (req, res, next) => {
//     const user = await User.findById(req.body.userId)
//     if (req.body.userId === "") {
//         if (req.query) {
//             const products = await Product.find(req.query).populate("category", "name")
//             if (products.length === 0) {
//                 return next(new AppError("Products not found", 404))
//             }
//             products.reverse()
//             return res.status(200).json({ products })
//         }
//         const products = await Product.find().populate("category", "name")

//         products.reverse()
//         return res.status(200).json({ products })
//     } else {
//         if (req.query) {
//             let products = await Product.find(req.query).populate("category", "name")
//             if (products.length === 0) {
//                 return next(new AppError("Products not found", 404))
//             }
//             if (user) {
//                 products = products.map((product) => {
//                     const isInFavorites = user.wishlist.some((wishlistProduct) => wishlistProduct.equals(product._id))
//                     return { ...product._doc, isInFavorites }
//                 })
//             }
//             products.reverse()
//             return res.status(200).json({ products })
//         }
//         const products = await Product.find().populate("category", "name")
//         console.log(products)
//         if (user) {
//             products = products.map((product) => {
//                 const isInFavorites = user.wishlist.some((wishlistProduct) => wishlistProduct.id === product._id)
//                 return { ...product._doc, isInFavorites }
//             })
//         }
//         products.reverse()
//         return res.status(200).json({ products })
//     }
// })

exports.getAll = catchAsync(async (req, res, next) => {
    const userId = req.body.userId
    const query = req.query

    let products

    if (userId === "") {
        products = await Product.find(query).populate("category", "name")
        products = products.map((product) => ({ ...product._doc, isInFavorites: false }));
    } else {
        const user = await User.findById(userId)
            products = await Product.find(query).populate("category", "name")
        if (user) {
            products = products.map((product) => ({
                ...product._doc,
                isInFavorites: user.wishlist.some((wishlistProduct) => wishlistProduct.equals(product._id)),
            }))
        }
    }

    if (products.length === 0) {
        return next(new AppError("Products not found", 404))
    }

    products.reverse()
    return res.status(200).json({ products })
})

exports.getProductsByMostSold = catchAsync(async (req, res, next) => {
    const products = await Product.find().sort({ sold: -1 }).populate("category", "name")
    return res.status(200).json({ products: products })
})

exports.editOne = catchAsync(async (req, res, next) => {
    const { title, slug, category, expDate, price, stock, sold, description, pills, sachets } = req.body
    const productId = req.params.id

    // Check if the category exists
    const existingCategory = await Category.findById(category)
    if (!existingCategory) {
        return next(new AppError("Invalid category ID", 400))
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
            title,
            slug,
            category,
            expDate,
            price,
            stock,
            sold,
            description,
            pills,
            sachets,
            // ... (other fields)
        },
        { new: true }
    )

    if (!updatedProduct) {
        return next(new AppError("Product not found", 404))
    }

    res.status(200).json({ message: "Product updated successfully", product: updatedProduct })
})

exports.deleteOne = catchAsync(async (req, res, next) => {
    const productId = req.params.id
    const product = await Product.findById(req.params.id)
    imageToken(product.imageCover)

    const deletedProduct = await Product.findByIdAndDelete(productId)

    if (!deletedProduct) {
        return next(new AppError("Product not found", 404))
    }

    res.status(204).json() // 204 means "No Content" after successful deletion
})
