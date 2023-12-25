const multer = require("multer")
const AppError = require("./appError")

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/") // Specify the destination folder for uploaded images
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname) // Define the file naming convention
    },
})

const upload = multer({ storage })

const singleUpload = upload.single("imageCover")
exports.uploadProductImage = (req, res, next) => {
    singleUpload(req, res, (err) => {
        if (err) {
            return next(new AppError("Error uploading product image", 400))
        }
        next()
    })
}

