import Stripe from 'stripe';
import config from '../config.js';

export default class PaymentsService {
    constructor() {
        this.stripe = new Stripe(config.STRIPE_KEY_SECRET);
    };

    // Métodos de PaymentsService:
        async newPaymentIntentService(uid, email, order) {
            let response = {};
            try {
                const paymentIntent = await this.stripe.checkout.sessions.create({
                    line_items: order.successfulProducts.map(product => ({
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: product.product.title,
                                description: product.product.description,
                            },
                            unit_amount: product.product.price * 100,
                        },
                        quantity: product.quantity,
                    })),
                    mode: 'payment',
                    metadata: {
                        uid: uid,
                        email: email
                    },
                    success_url: 'http://localhost:8080/paySuccess',
                    cancel_url: 'http://localhost:8080/cart',
                })
                if (paymentIntent.url) {
                    response.statusCode = 200;
                    response.message = "Intento de pago generado exitosamente.";
                    response.result = paymentIntent.url;
                } else {
                    response.statusCode = 500;
                    response.message = "Error al obtener la URL de Stripe.";
                }
            } catch (error) {
                response.statusCode = 500;
                response.message = "Error al generar intento de pago - Service: " + error.message;
            };
            return response;
        };
};