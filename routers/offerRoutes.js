const express = require("express")
const { createOffer, getOffers, updateOffer, deleteOffer } = require("../controllers/offersControllers")
const { auth, allowTo } = require("../validators/tokenChecker")
const upload = require("../utils/multer")
const { uploadIMG } = require("../utils/cloudinaryUpload")
const router = express.Router()

// Create a new offer
router.post("/offers", auth, allowTo("admin"), upload.single("imageCover"), uploadIMG, createOffer)
router.get("/offers", getOffers)
router.put("/offers/:id", auth, allowTo("admin"), updateOffer)
router.delete("/offers/:id", auth, allowTo("admin"), deleteOffer)

module.exports = router
