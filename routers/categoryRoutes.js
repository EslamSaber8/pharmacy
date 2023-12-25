const express = require("express")
const { authAdmin } = require("../validators/tokenChecker")
const { createOneCAT, getAllCAT, editOneCAT, deleteCAT } = require("../controllers/categoryControllers")
const { auth, allowTo } = require("../validators/tokenChecker")
const upload = require("../utils/multer")
const { uploadIMG } = require("../utils/cloudinaryUpload")
const router = express.Router()

router.post("/categories", auth, allowTo("admin"), upload.single("imageCover"), uploadIMG, createOneCAT)
router.get("/categories", getAllCAT)
router.put("/categories/:id", auth, allowTo("admin"), editOneCAT)
router.delete("/categories/:id", auth, allowTo("admin"), deleteCAT)

module.exports = router
