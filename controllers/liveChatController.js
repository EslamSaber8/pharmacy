const chatRoom = require("../models/chatRoom")
// const Message = require("../models/liveChatModel")
const catchAsync = require("../utils/catchAsync")
// exports.messages = catchAsync(async (req, res, next) => {
//     try {
//         const { userId, content } = req.body

//         // Find or create a conversation for the user
//         let conversation = await Message.findOneAndUpdate(
//             { userId },
//             { $setOnInsert: { userId, conversations: {} } }, // Ensure conversations is initialized as an empty object
//             { upsert: true, new: true }
//         )

//         // Check if the conversation with the admin exists

//         // Push the new message to the user's conversation with the admin
//         conversation.conversations.messages.push({
//             sender: userId,
//             content,
//         })
//         // Save the updated conversation
//         const updatedConversation = await conversation.save()

//         res.status(201).json(updatedConversation)
//     } catch (error) {
//         console.error(error)
//         res.status(500).json({ error: "Internal Server Error" })
//     }
// })

// exports.messagesGet = catchAsync(async (req, res, next) => {
//     res.setHeader("Content-Type", "text/event-stream")
//     res.setHeader("Cache-Control", "no-cache")
//     res.setHeader("Connection", "keep-alive")

//     const userId = req.params.userId
//     res.write("event: connected\ndata: Connected to SSE\n\n")

//     const sendEvent = (data) => {
//         res.write(`data: ${JSON.stringify(data)}\n\n`)
//         console.log(`data: ${JSON.stringify(data)}\n\n`)
//     }

//     const changeStream = Message.watch([
//         {
//             $match: {
//                 $or: [{ "fullDocument.userId": userId }, { "updateDescription.updatedFields.conversations": { $exists: false } }],
//             },
//         },
//     ])
//     console.log(changeStream)
//     changeStream.on("change", (change) => {
//         const conversations = change.fullDocument.conversations || {}
//         console.log("halla")
//         if (conversations.withUser && conversations.userId === userId) {
//             sendEvent({ message: "New message", data: change })
//         }
//     })

//     req.on("close", () => {
//         console.log("Client disconnected")
//         changeStream.close()
//     })
// })

exports.createChatroom = catchAsync(async (req, res) => {
    console.log(req.user)

    const chatroomExists = await chatRoom.findOne(req.user._id)

    if (chatroomExists) throw "Chatroom with that name already exists!"

    const chatroom = new chatRoom({
        name: req.user._id,
    })

    await chatroom.save()

    res.json({
        message: "Chatroom created!",
    })
})

exports.getAllChatrooms = catchAsync(async (req, res) => {
    const chatrooms = await chatRoom.find({})

    res.json(chatrooms)
})
