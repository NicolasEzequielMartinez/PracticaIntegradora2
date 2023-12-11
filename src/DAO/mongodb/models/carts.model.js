import mongoose from "mongoose";

const collection = "carts";

const CartsSchema = new mongoose.Schema(
    {
        products: {
            type: [
                {
                    product: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "products",
                    },
                    quantity: {
                        type: Number,
                    },
                },
            ],
        },
        tickets: {
            type: [{
                ticketsRef:{
                    type: mongoose.Schema.Types.ObjectId,
                    ref:"ticket",
                },
            }],
        },
    },
);

export const cartModel = mongoose.model(collection, CartsSchema);
