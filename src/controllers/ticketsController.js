import TicketService from "../services/tickets.service.js";
import mongoose from "mongoose";

import ErrorEnums from "../errors/error.enums.js";
import CustomError from "../errors/customError.class.js";
import ErrorGenerator from "../errors/error.info.js";

export default class TicketController {
    constructor() {
        this.ticketService = new TicketService();
    }
    // Métodos TicketController: 
    async createTicketController(req, res, next) {
        const ticketInfo = req.body;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        try {
            if (
                !Array.isArray(ticketInfo.successfulProducts) ||
                !ticketInfo.successfulProducts.every(productInfo => (
                    mongoose.Types.ObjectId.isValid(productInfo._id) &&
                    typeof productInfo.quantity === 'number' &&
                    typeof productInfo.title === 'string' &&
                    typeof productInfo.price === 'number' &&
                    productInfo.quantity > 0 &&
                    productInfo.price > 0
                )) ||
                !Array.isArray(ticketInfo.failedProducts) ||
                !ticketInfo.failedProducts.every(productInfo => (
                    mongoose.Types.ObjectId.isValid(productInfo._id) &&
                    typeof productInfo.quantity === 'number' &&
                    typeof productInfo.title === 'string' &&
                    typeof productInfo.price === 'number' &&
                    productInfo.quantity > 0 &&
                    productInfo.price > 0
                )) ||
                !ticketInfo.purchase ||
                !emailRegex.test(ticketInfo.purchase) ||
                !ticketInfo.amount ||
                typeof ticketInfo.amount === 'string' ||
                ticketInfo.amount <= 0
            ) {
                CustomError.createError({
                    name: "Error al crear el nuevo ticket.",
                    cause: ErrorGenerator.generateTicketDataErrorInfo(ticketInfo),
                    message: "La información para crear el ticket está incompleta o no es válida.",
                    code: ErrorEnums.INVALID_TICKET_DATA
                });
            };
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.ticketService.createTicketService(ticketInfo);
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
            response.message = "Error al crear el ticket - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async getTicketByIdController(req, res, next) {
        const tid = req.params.tid;
        try {
            if (!tid || !mongoose.Types.ObjectId.isValid(tid)) {
                CustomError.createError({
                    name: "Error al obtener el ticket por ID.",
                    cause: ErrorGenerator.generateTidErrorInfo(tid),
                    message: "El ID de ticket proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_TICKET_ERROR
                });
            };
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.ticketService.getTicketByIdService(tid);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener el ticket por ID - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };
    
}
