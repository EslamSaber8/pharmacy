const mongoose = require("mongoose")
const messageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    conversations: 
        {
            withUser: { type: String, default: "admin" },
            messages: [
                {
                    sender: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "User",
                    },
                    content: String,
                    timestamp: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
        },
    
})

const Message = mongoose.model("Message", messageSchema)

module.exports = Message
