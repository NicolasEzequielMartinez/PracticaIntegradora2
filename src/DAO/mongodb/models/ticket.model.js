import mongoose from 'mongoose';
import {v4 as uuidv4} from 'uuid';

const collection = "ticket";
const productSchema = new mongoose.Schema({
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
    },
    quantity: {
        type: Number,
        required: true,
    },
    title: {
        type: String,
        required: true,
    }, 
    price: {
        type: Number,
        required: true,
    },
});
const ticketSchema = new mongoose.Schema({
    code: {
        type: String,
        default: uuidv4, 
    },
    purchase_datetime: {
        type: String,
        default: new Date().toLocaleDateString()  + " - " + new Date().toLocaleTimeString(),
    },
    successfulProducts: [productSchema],
    failedProducts: [productSchema],
    purchase: {
        type: String,
    },
    amount: {
        type: Number,
    }
});

export const ticketModel = mongoose.model(collection, ticketSchema);