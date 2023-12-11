import jwt from 'jsonwebtoken';
import passport from 'passport';
import config from "../../config.js";

import { CurrentUserDTO } from '../../controllers/DTO/user.dto.js';
import { createBDUserGH } from '../../config/gitHub.passport.js';

import ErrorEnums from "../../errors/error.enums.js";
import CustomError from "../../errors/customError.class.js";
import ErrorGenerator from "../../errors/error.info.js";

// Middleware Register:
export const registerUser = (req, res, next) => {
    try {
        const userRegister = req.body;
        userRegister.age = parseInt(userRegister.age, 10);
        const hasNumbers = (inputString) => {
            const regex = /\d/;
            return regex.test(inputString);
        };
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!userRegister.first_name || typeof userRegister.first_name !== 'string' || hasNumbers(userRegister.first_name) ||
            !userRegister.last_name || typeof userRegister.last_name !== 'string' || hasNumbers(userRegister.last_name) ||
            !userRegister.email || !emailRegex.test(userRegister.email) ||
            !userRegister.age || typeof userRegister.age !== 'number' || userRegister.password === undefined)
            CustomError.createError({
                name: "Error al registrar al usuario.",
                cause: ErrorGenerator.generateRegisterDataErrorInfo(userRegister),
                message: "La información para el registro está incompleta o no es válida.",
                code: ErrorEnums.INVALID_REGISTER_DATA
            });
    } catch (error) {
        return next(error);
    }
    passport.authenticate('register', {
        session: false
    }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(info.statusCode).json({
                message: info.message
            });
        }
        res.status(info.statusCode).json({
            message: 'Registro exitoso',
            user
        });
    })(req, res, next);
};

// Middleware Login:
export const loginUser = (req, res, next) => {
    try {
        const userLogin = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!userLogin.email || !emailRegex.test(userLogin.email) || userLogin.password === undefined)
            CustomError.createError({
                name: "Error al loguear el usuario.",
                cause: ErrorGenerator.generateLoginDataErrorInfo(userLogin),
                message: "La información para el logueo está incompleta o no es válida.",
                code: ErrorEnums.INVALID_LOGIN_DATA
            });
    } catch (error) {
        return next(error);
    }
    passport.authenticate('login', {
        session: false
    }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(info.statusCode).json({
                statusCode: info.statusCode,
                message: info.message
            });
        } else {
            let token = jwt.sign({
                email: user.email,
                first_name: user.first_name,
                tickets: user.tickets,
                role: user.role,
                cart: user.cart,
                userID: user._id
            }, config.JWT_SECRET, {
                expiresIn: '7d'
            });
            res.cookie(config.JWT_COOKIE, token, {
                httpOnly: true,
                signed: true,
                maxAge: 7 * 24 * 60 * 60 * 1000
            }).status(info.statusCode).json({
                statusCode: info.statusCode,
                message: 'Login exitoso',
                role: user.role
            });
        }
    })(req, res, next);
};

// Middleware GitHub:
export const authenticateWithGitHub = (req, res, next) => {
    passport.authenticate('github', {
        session: false
    }, async (err, user, info) => {
        if (err) {
            return next(err);
        };
        if (!user) {
            return res.status(info.statusCode).json({
                message: info.message
            });
        } else if (user) {
            const resultDB_GH = await createBDUserGH(req, res, next, user);
            if (resultDB_GH.statusCode === 500){
                return res.status(resultDB_GH.statusCode).json({
                    message: resultDB_GH.message
                });
            } else if (resultDB_GH.result.password !== "Sin contraseña.") {
                res.redirect('/products');
            } 
            else if (resultDB_GH.result.password === "Sin contraseña.") {
                res.cookie(config.JWT_USER, resultDB_GH.result._id, {
                    httpOnly: true,
                    signed: true,
                    maxAge: 3 * 60 * 1000
                }).redirect('/completeProfile');
            }
        }
    })(req, res, next);
};

// Current:
export const getCurrentUser = (req, res) => {
    res.send(new CurrentUserDTO(req.user));
};