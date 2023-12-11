import MessageService from '../services/message.service.js'
import mongoose from 'mongoose';

import ErrorEnums from "../errors/error.enums.js";
import CustomError from "../errors/customError.class.js";
import ErrorGenerator from "../errors/error.info.js";

export default class MessageController {
    constructor() {
        this.messageService = new MessageService();
    }
    // Métodos MessageController:
    async createMessageController(req, res, next) {
        const messageData = req.body;
        try {
            if (!messageData.user || typeof messageData.user === 'number' || !messageData.message) {
                CustomError.createError({
                    name: "Error al crear el mensaje.",
                    cause: ErrorGenerator.generateMessageDataErrorInfo(messageData),
                    message: "La información para crear el mensaje está incompleta o no es válida.",
                    code: ErrorEnums.INVALID_MESSAGE_DATA
                });
            }
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.messageService.createMessageService(messageData);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 200) {
                const messages = await this.messageService.getAllMessageService();
                req.socketServer.sockets.emit('messages', messages)
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al crear el mensaje - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async getAllMessageController(req, res) {
        let response = {};
        try {
            const resultService = await this.messageService.getAllMessageService();
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                const messages = await this.messageService.getAllMessageService();
                req.socketServer.sockets.emit('messages', messages);
                response.result = resultService.result;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener los mensajes - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async deleteMessageController(req, res, next) {
        const mid = req.params.mid;
        const uid = req.user.userID;
        try {
            if (!mid || !mongoose.Types.ObjectId.isValid(mid)) {
                CustomError.createError({
                    name: "Error al eliminar el mensaje.",
                    cause: ErrorGenerator.generateMidErrorInfo(mid),
                    message: "El ID de mensaje proporcionado no es válido.",
                    code: ErrorEnums.INVALID_MESSAGE_DATA
                });
            } else if (!uid || !mongoose.Types.ObjectId.isValid(uid)) {
                CustomError.createError({
                    name: "Error al eliminar el mensaje.",
                    cause: ErrorGenerator.generateUserIdInfo(uid),
                    message: "El ID de usuario proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_USER_ERROR
                });
            }
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.messageService.deleteMessageService(mid, uid);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404 || resultService.statusCode === 403) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                const messages = await this.messageService.getAllMessageService();
                req.socketServer.sockets.emit('messages', messages);
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar el mensaje: - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };
}