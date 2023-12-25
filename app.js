const express = require("express")
const morgan = require("morgan")
const productRoutes = require("./routers/productRoutes")
const userRouters = require("./routers/usersRoutes")
const authRouters = require("./routers/authRoutes")
const cartRouters = require("./routers/cartRoutes")
const categoryRouters = require("./routers/categoryRoutes")
const orderRouters = require("./routers/orderRoutes")
const chatRouters = require("./routers/messageRoutes")
const offerRouters = require("./routers/offerRoutes")
const wishlistRouters = require("./routers/wishlistRoutes")
const deliveryRouters=require("./routers/deliveryRoutes")
const AppError = require("./utils/appError")
const app = express()
const cors = require("cors")
app.use(express.json())

app.use(morgan("dev"))
app.use(cors())
app.use("/uploads", express.static("uploads"))
app.use("/api", productRoutes, wishlistRouters,userRouters,authRouters,chatRouters,categoryRouters,orderRouters,cartRouters,offerRouters,deliveryRouters)


app.get("/", (req, res) => {
    res.send("Hello World")
})

app.use((err, req, res, next) => {
    // Check if the error is an instance of your AppError class
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    }

    console.log(err)
    // Handle other errors
    res.status(500).json({
        status: "error",
        message: err.message,
        statusCode: err.code,
    })
})

module.exports = app
