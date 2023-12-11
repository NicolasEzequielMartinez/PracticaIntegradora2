import mongoose from "mongoose";

const collection = 'users';

const UserSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    age: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts',
    },
    role: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        default: 'https://i.ibb.co/nnQFzM2/ADD-PHOTO-removebg-preview.png'
    },
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'carts',
    },
    documents: {
        type: [{
            name: {
                type: String,
                required: true
            },
            reference: {
                type: String,
                required: true
            }
        }]
    },
    last_connection: {
        type: String,
        default: null
    },
})

export const userModel = mongoose.model(collection, UserSchema);