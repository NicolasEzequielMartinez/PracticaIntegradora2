import Stripe from 'stripe';
import config from "../config.js";

export default class PaymentsService {
    constructor(){
        this.stripe = new Stripe(config.STRIPE_KEY_SECRET)
    };
    createPaymentIntent = async (data) => {
        const paymentIntent = this.stripe.paymentIntents.create(data);
        return paymentIntent;
    }; 
};