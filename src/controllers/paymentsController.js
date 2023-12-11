import PaymentsService from '../services/payments.service.js'
import mongoose from "mongoose";

import ErrorEnums from "../errors/error.enums.js";
import CustomError from "../errors/customError.class.js";
import ErrorGenerator from "../errors/error.info.js";

import config from '../config.js';

export default class PaymentsController {

    constructor() {
        this.paymentsService = new PaymentsService();
    }


    async newPaymentIntentController(req, res, next) {
        const uid = req.user.userID;
        const email = req.user.email;
        const order = req.signedCookies[config.PURCHASE_ORDER];
        try {
            if (!uid || !mongoose.Types.ObjectId.isValid(uid)) {
                CustomError.createError({
                    name: "Error en el proceso generar intento de pago.",
                    cause: ErrorGenerator.generateUserIdInfo(uid),
                    message: "El ID de usuario proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_USER_ERROR
                });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                CustomError.createError({
                    name: "Error en el proceso generar intento de pago.",
                    cause: ErrorGenerator.generateResetPass1Info(email),
                    message: "El correo está incompleto o no es válido.",
                    code: ErrorEnums.INVALID_EMAIL_USER
                });
            } else if (!order.amount || order.amount <= 0 || typeof order.amount !== 'number') {
                CustomError.createError({
                    name: "Error en el proceso generar intento de pago.",
                    cause: ErrorGenerator.generateAmountEInfo(orderData.amount),
                    message: "El monto total no es válido.",
                    code: ErrorEnums.INVALID_AMOUNT_ORDER
                });
            } else if (order.successfulProducts.length > 0) {
                for (const product of order.successfulProducts) {
                    if (!product.product ||
                        !product.product._id || !mongoose.Types.ObjectId.isValid(product.product._id) ||
                        !product.product.title ||
                        !product.product.code ||
                        !product.product.price ||
                        !product.quantity ||
                        !product._id || !mongoose.Types.ObjectId.isValid(product._id)
                    ) {
                        CustomError.createError({
                            name: "Error en el proceso generar intento de pago.",
                            cause: ErrorGenerator.generateProductOrderEInfo(product.product),
                            message: "Los datos del producto estan incompletos o no son validos.",
                            code: ErrorEnums.INVALID_PRODUCT_ORDER_DATA
                        });
                    }
                };
            };
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.paymentsService.newPaymentIntentService(uid, email, order);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al generar intento de pago - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

};