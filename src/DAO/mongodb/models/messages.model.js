import mongoose from "mongoose";

const collection = "messages";

const MessagesSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    time: {
        type: String,
        default: null
    },
})

export const messageModel = mongoose.model(collection, MessagesSchema);
