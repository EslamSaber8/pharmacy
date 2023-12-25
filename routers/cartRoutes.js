const express = require("express")

const { placeCart, getAllOrders, editQuantityAdd, editQuantityMinus, deleteItem } = require("../controllers/cartControllers")
const { auth } = require("../validators/tokenChecker")
const router = express.Router()

router.post("/cart", auth, placeCart)

router.put("/cart/add/:productId", auth, editQuantityAdd).put("/cart/remove/:productId", auth, editQuantityMinus)
router.delete("/cart/:productId", auth, deleteItem)
router.get("/cart", auth, getAllOrders)

module.exports = router
