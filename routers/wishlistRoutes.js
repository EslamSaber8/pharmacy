const express = require("express")

const { auth } = require("../validators/tokenChecker")
const { addProductToWishlist, getLoggedUserWishlist, removeProductFromWishlist } = require("../controllers/wishlistControllers")

const router = express.Router()

// router.use(auth);

router.route("/wishlist").post(auth, addProductToWishlist).get(auth, getLoggedUserWishlist)

router.delete("/wishlist/:productId", auth, removeProductFromWishlist)

module.exports = router
