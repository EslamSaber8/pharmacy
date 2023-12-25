const express = require("express")
const { signup, signin, reSendverify, verify, forgetPassword, forgetPasswordConfirm } = require("../controllers/authContorllers")

const router = express.Router()

router.post("/auth/signup", signup)
router.post("/auth/signin", signin)
router.post("/auth/verify", verify)
router.post("/auth/resendverify", reSendverify)
router.post("/auth/forgetpassword", forgetPassword)
router.post("/auth/forgetpasswordrest", forgetPasswordConfirm)

module.exports = router
