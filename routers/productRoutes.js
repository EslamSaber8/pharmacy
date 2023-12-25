const express = require("express")
const { createOne, getAll, getOne, deleteOne, editOne, getProductsByMostSold } = require("../controllers/productControllers")

const { auth, allowTo } = require("../validators/tokenChecker")
const { uploadIMG } = require("../utils/cloudinaryUpload")
const upload = require("../utils/multer")

const router = express.Router()

router.post("/products", auth, allowTo("admin"), upload.single("imageCover"), uploadIMG, createOne)
router.get("/products", getAll).get("/popular", getProductsByMostSold)
router.get("/products/:id", getOne).delete("/products/:id", auth, allowTo("admin"), deleteOne).put("/products/:id", auth, allowTo("admin"), editOne)

module.exports = router
