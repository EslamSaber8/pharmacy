const { getAllChatrooms, createChatroom } = require("../controllers/liveChatController")
// const express = require("express")
// const router = express.Router()

const { auth } = require("../validators/tokenChecker")

// router.post("/message", messages).get("/messages/:userId", messagesGet)

// // router.post("/signin", signin)

// module.exports = router

const router = require("express").Router()

router.get("/chats", auth, getAllChatrooms)
router.post("/chats", auth, createChatroom)

module.exports = router
