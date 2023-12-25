const mongoose = require("mongoose")
const dotenv = require("dotenv")
require("dotenv").config()
dotenv.config({ path: "./.env" })

const jwt = require("jsonwebtoken")
const { User } = require("./models/userModel")
const Messages = require("./models/Message")

process.on("uncaughtException", (err) => {
    console.log("uncaughtException! Shutting down... ")
    console.log(err.name, err.message)
})

const app = require("./app")

mongoose
    .connect(process.env.DB_URI, {
        dbName: `pharmacy`,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("Connected to MongoDB")
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:", error)
    })

const port = process.env.PORT || 8080
const server = app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
})

process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED Rejection! Shutting down... ")
    console.log(err)
    console.log(err.name, err.message)

    server.close(() => {
        process.exit(1) // zero stands for success and one stands for uncaught exception);
    })
})
///////////////////////////////////////////////////////////////////////////////////

const io = require("socket.io")(server, {
    allowEIO3: true,
    cors: {
        origin: true,
        methods: ["GET", "POST"],
        credentials: true,
    },
})


io.use(async (socket, next) => {
    try {
        const token = socket.handshake.query.token

        const payload = jwt.verify(token, process.env.JWT_SECRET)
        socket.userId = payload.id
        next()
    } catch (err) {}
})

io.on("connection", (socket) => {
    console.log("Connected: " + socket.userId)

    socket.on("disconnect", () => {
        console.log("Disconnected: " + socket.userId)
    })

    socket.on("joinRoom", ({ chatroomId }) => {
        socket.join(chatroomId)
        console.log("A user joined chatroom: " + chatroomId)
    })

    socket.on("leaveRoom", ({ chatroomId }) => {
        socket.leave(chatroomId)
        console.log("A user left chatroom: " + chatroomId)
    })

    socket.on("chatroomMessage", async ({ chatroomId, message }) => {
        if (message.trim().length > 0) {
            const user = await User.findOne({ _id: socket.userId })
            const newMessage = new Messages({
                chatroom: chatroomId,
                user: socket.userId,
                message,
            })
            io.to(chatroomId).emit("newMessage", {
                message,
                name: user.username,
                userId: socket.userId,
            })
            await newMessage.save()
        }
    })
})
