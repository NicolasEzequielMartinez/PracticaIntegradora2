import { Router } from "express";
import passport from "passport";
import { rolesRMiddlewareUsers } from "./middlewares/rolesRoutes.middleware.js";
import PaymentsService from "../services/stripe.service.js";

const stripeRouter = Router();

stripeRouter.post('/paymentsIntents', passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/invalidToken'
}), rolesRMiddlewareUsers, async (req, res) => {
    const service = new PaymentsService();
    const paymentIntentInfo = {
        amount: 1000,
        currency: "usd",
    }
    let result = await service.createPaymentIntent(paymentIntentInfo);
    res.send({
        status: "success",
        payload: result
    })
})

export default stripeRouter;