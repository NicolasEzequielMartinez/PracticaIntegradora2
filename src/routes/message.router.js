import { Router } from "express";
import MessageController from "../controllers/messageController.js";
import passport from "passport";
import { rolesRMiddlewareUsers } from './middlewares/rolesRoutes.middleware.js';

const msmRouter = Router();
let messageController = new MessageController();

msmRouter.post('/', passport.authenticate('jwt', {session: false }), rolesRMiddlewareUsers, async (req, res, next) => {
    const result = await messageController.createMessageController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

msmRouter.get('/', passport.authenticate('jwt', {session: false }), rolesRMiddlewareUsers, async (req, res) => {
    const result = await messageController.getAllMessageController(req, res);
    res.status(result.statusCode).send(result);
});

msmRouter.delete('/:mid', passport.authenticate('jwt', {session: false}), rolesRMiddlewareUsers, async (req, res, next) => {
    const result = await messageController.deleteMessageController(req, res, next);
    if(result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

export default msmRouter;