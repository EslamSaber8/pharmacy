const express = require("express")
const { placeOrder, getOrder, getAllOrder } = require("../controllers/orderControllers")
const { auth, allowTo } = require("../validators/tokenChecker")

const router = express.Router()

router.get("/orders", auth, getOrder).post("/orders/:cartId", auth, placeOrder).get("/orders/getall", auth, allowTo("admin"), getAllOrder)

module.exports = router
