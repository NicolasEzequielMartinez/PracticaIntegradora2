import { Router } from 'express';
import passport from 'passport';
import UserController from '../controllers/userController.js';
import { rolesRMiddlewareUsers, rolesRMiddlewareAdmin, rolesRMiddlewarePublic } from "./middlewares/rolesRoutes.middleware.js";
import { uploaderDocuments } from './middlewares/multer.middleware.js'

const userRouter = Router();

let userController = new UserController();


// POST USER DOCUMENTS
userRouter.post('/:uid/documents',
passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken'}), rolesRMiddlewareUsers, uploaderDocuments.fields([{
        name: 'identification',
        maxCount: 1
    },
    {
        name: 'proofOfAddress',
        maxCount: 1
    },
    {
        name: 'bankStatement',
        maxCount: 1
    }
]), async (req, res, next) => {
    const result = await userController.uploadPremiumDocsController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

//  CHANGE ROLE CONTROLLER 
userRouter.post('/premium/:uid', passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken'}), rolesRMiddlewarePublic, async (req, res, next) => {
    const result = await userController.changeRoleController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// GET ALL USERS
userRouter.get('/getAllUsers', passport.authenticate('jwt', { session: false,  failureRedirect: '/invalidToken'}), rolesRMiddlewareAdmin, async (req, res) => {
    const result = await userController.getAllUsersController(req, res);
    res.status(result.statusCode).send(result);
});

// DELETE INECTIVE USERS (2 DAYS)
userRouter.delete('/deleteInactivityUsers', passport.authenticate('jwt', { session: false,  failureRedirect: '/invalidToken'}), rolesRMiddlewareAdmin, async (req, res) => {
    const result = await userController.deleteInactivityUsersController(req, res);
    res.status(result.statusCode).send(result);
});

export default userRouter;