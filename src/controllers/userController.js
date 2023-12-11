import UserService from '../services/user.service.js';
import mongoose from "mongoose";

import ErrorEnums from "../errors/error.enums.js";
import CustomError from "../errors/customError.class.js";
import ErrorGenerator from "../errors/error.info.js";

export default class UserController {
    constructor() {
        this.userService = new UserService();
    }
    // Métodos para UserController: 
    async uploadPremiumDocsController(req, res, next) {
        const uid = req.params.uid
        let rutaIdentification;
        let rutaProofOfAddres;
        let rutaBankStatement;
        const parteComun = 'public\\';
        if (req.files && req.files.identification) {
            const identification = req.files.identification[0].path;
            const indice = identification.indexOf(parteComun);
            const ruta = identification.substring(indice + parteComun.length);
            rutaIdentification = `${ruta}`
        }
        if (req.files && req.files.proofOfAddress) {
            const proofOfAddress = req.files.proofOfAddress[0].path;
            const indice = proofOfAddress.indexOf(parteComun);
            const ruta = proofOfAddress.substring(indice + parteComun.length);
            rutaProofOfAddres = `${ruta}`
        }
        if (req.files && req.files.bankStatement) {
            const bankStatement = req.files.bankStatement[0].path;
            const indice = bankStatement.indexOf(parteComun);
            const ruta = bankStatement.substring(indice + parteComun.length);
            rutaBankStatement = `${ruta}`
        }
        try {
            if (!uid || !mongoose.Types.ObjectId.isValid(uid)) {
                CustomError.createError({
                    name: "Error al obtener al usuario por ID.",
                    cause: ErrorGenerator.generateUserIdInfo(uid),
                    message: "El ID de usuario proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_USER_ERROR
                });
            } else if (rutaIdentification === undefined && rutaProofOfAddres === undefined && rutaBankStatement === undefined) {
                CustomError.createError({
                    name: "Error al subir documentación de usuario.",
                    cause: ErrorGenerator.uploadPremiumDocsErrorInfo(req.files.identification, req.files.proofOfAddress, req.files.bankStatement),
                    message: "La solicitud no incluye documentos para agregar o actualizar en este momento.",
                    code: ErrorEnums.INVALID_FORM_FILES_ERROR
                });
            }
        } catch (error) {
            return next(error);
        };
        const documentsRuta = [rutaIdentification, rutaProofOfAddres, rutaBankStatement];
        const documentNames = ["Identificación", "Comprobante de domicilio", "Comprobante de estado de cuenta"];
        let response = {};
        try {
            const resultService = await this.userService.uploadPremiumDocsService(uid, documentsRuta, documentNames);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 206 || resultService.statusCode === 200) {
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al subir documentación de usuario - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async changeRoleController(req, res, next) {
        const uid = req.params.uid;
        const requesterRole = req.user.role;
        try {
            if (!uid || !mongoose.Types.ObjectId.isValid(uid)) {
                CustomError.createError({
                    name: "Error al obtener al usuario por ID.",
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
            const resultService = await this.userService.changeRoleService(res, uid, requesterRole);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404 || resultService.statusCode === 422) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al modificar el rol del usuario - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async getAllUsersController(req, res) {
        let response = {};
        try {
            const resultService = await this.userService.getAllUsersService();
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
            response.message = "Error al obtener los usuarios - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async deleteInactivityUsersController(req, res){
        let response = {};
        try {
            const resultService = await this.userService.deleteInactivityUsersService();
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
            response.message = "Error al eliminar usuarios inactivos - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };


};