const cloudinary = require("../config/cloudinray.js")

exports.uploadIMG = async (req, res, next) => {

    if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: "Pharmacy/",
        })

        req.body.imageCover = result.secure_url
    }
    next()
}
