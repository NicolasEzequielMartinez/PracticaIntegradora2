import { Router } from "express";
import passport from "passport";
import {completeProfile} from '../config/formExtra.js'
import { registerUser, loginUser, getCurrentUser, authenticateWithGitHub } from './middlewares/passport.middleware.js';
import SessionController from '../controllers/sessionController.js';
import { rolesRMiddlewareUsers, rolesRMiddlewarePublic } from "./middlewares/rolesRoutes.middleware.js";
import { ProfileUserDTO } from '../controllers/DTO/userProfile.dto.js';
import { DocsUserDTO } from '../controllers/DTO/userDocs.dto.js'
import { uploaderPofiles } from '../routes/middlewares/multer.middleware.js'


const sessionRouter = Router();
let sessionController = new SessionController();

// REGISTER
sessionRouter.post('/register', registerUser);

//LOGIN
sessionRouter.post('/login', loginUser);

// GITHUB
sessionRouter.get('/github', passport.authenticate('github', { session: false, scope: 'user:email' }));
sessionRouter.get('/githubcallback', authenticateWithGitHub);

// EXTRA FORM 
sessionRouter.post('/completeProfile', completeProfile);

// CURRENT
sessionRouter.get('/current', passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken' }), rolesRMiddlewarePublic, getCurrentUser);

// PERFIL USER
sessionRouter.get('/profile', passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/invalidToken'
}), rolesRMiddlewareUsers, async (req, res) => {
    const result = await sessionController.getUserController(req, res);
    if (result.statusCode === 200) {
        const resultFilter = new ProfileUserDTO(result.result);
        if (resultFilter) {
            result.result = resultFilter;
        };
    }
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// DOCS USERS:
sessionRouter.get('/getDocsUser', passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/invalidToken'
}), rolesRMiddlewareUsers, async (req, res) => {
    const result = await sessionController.getUserController(req, res);
    if (result.statusCode === 200) {
        const resultFilter = new DocsUserDTO(result.result);
        if (resultFilter) {
            result.result = resultFilter;
        };
    }
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// EMAIL RESET PASS:
sessionRouter.post('/requestResetPassword', async (req, res, next) => {
    const result = await sessionController.getUserAndSendEmailController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// RESET USER PASS:
sessionRouter.post('/resetPassword', async (req, res, next) => {
    const result = await sessionController.resetPassUserController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// EDIT PERFIL:
sessionRouter.post('/editProfile', passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/invalidToken'
}), rolesRMiddlewareUsers, uploaderPofiles.single('profile'), async (req, res, next) => {
    const result = await sessionController.editProfileController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// LOGOUT:
sessionRouter.post('/logout', passport.authenticate('jwt', {
    session: false,
    failureRedirect: '/invalidToken'
}), rolesRMiddlewarePublic, async (req, res, next) => {
    const result = await sessionController.logoutController(req, res, next);
    if (result !== undefined) {
        res.status(result.statusCode).send(result);
    };
});

// DELETE ACCOUNT:
sessionRouter.delete('/deleteAccount/:uid', passport.authenticate('jwt', {
        session: false,
        failureRedirect: '/invalidToken'
    }), rolesRMiddlewarePublic,
    async (req, res, next) => {
        const result = await sessionController.deleteUserController(req, res, next);
        if (result !== undefined) {
            res.status(result.statusCode).send(result);
        };
    }
);

export default sessionRouter;