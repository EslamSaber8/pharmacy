const express = require("express")
const { getAllUsers, getUser, updateProfile, changePassword } = require("../controllers/userControllers")
const { auth } = require("../validators/tokenChecker")

const router = express.Router()

router.get("/users", getAllUsers)
router.get("/users/:id", getUser)
router.put("/user/updateme", auth, updateProfile)
router.put("/user/updatepassword", auth, changePassword)
module.exports = router
