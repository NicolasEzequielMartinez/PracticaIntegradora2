import { Router } from "express";
import passport from 'passport';
import TicketController from '../controllers/ticketsController.js'
import { rolesRMiddlewareUsers, rolesRMiddlewareAdmin } from "./middlewares/rolesRoutes.middleware.js";


const ticketRouter = Router();

let ticketController = new TicketController();

ticketRouter.post("/", passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken'}), rolesRMiddlewareUsers, async (req, res, next) => {
    const result = await ticketController.createTicketController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

ticketRouter.get("/:tid", passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken'}), rolesRMiddlewareAdmin, async (req, res, next) => {
    const result = await ticketController.getTicketByIdController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

export default ticketRouter;