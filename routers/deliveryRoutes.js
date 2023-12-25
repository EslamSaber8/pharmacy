const express = require("express")
const { getAllDeliveries,getDelivery,editDelivery,deleteDelivery,createDelivery} = require("../controllers/deliveryController")
const { auth, allowTo } = require("../validators/tokenChecker")
const router = express.Router()
app.use(allowTo("admin"))
router.route("/").get(getAllDeliveries).post(createDelivery);
router.route("/:id").get(getDelivery).patch(editDelivery).delete(deleteDelivery);
module.exports = router
