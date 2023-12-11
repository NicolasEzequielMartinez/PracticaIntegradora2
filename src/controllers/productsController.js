import ProductService from '../services/products.service.js';
import mongoose from 'mongoose';

import ErrorEnums from "../errors/error.enums.js";
import CustomError from "../errors/customError.class.js";
import ErrorGenerator from "../errors/error.info.js";

export default class ProductController {
    constructor() {
        this.productService = new ProductService();
    }
    // Métodos ProductController:
    async createProductController(req, res, next) {
        const productData = req.body;
        let rutaImg1;
        let rutaImg2;
        const parteComun = 'public\\';
        if (req.files && req.files.Img1) {
            const Img1 = req.files.Img1[0].path;
            const indice = Img1.indexOf(parteComun);
            const ruta = Img1.substring(indice + parteComun.length);
            rutaImg1 = ruta
        };
        if (req.files && req.files.Img2) {
            const Img2 = req.files.Img2[0].path;
            const indice = Img2.indexOf(parteComun);
            const ruta = Img2.substring(indice + parteComun.length);
            rutaImg2 = ruta
        };
        const price = parseFloat(productData.price);
        const stock = parseFloat(productData.stock);
        try {
            if (!productData.title || typeof productData.title === 'number' || !productData.description || typeof productData.description === 'number' ||
                !productData.code || typeof productData.code === 'number' || !price || typeof price === 'string' || price <= 0 ||
                !stock || typeof stock === 'string' || stock <= 0 || !productData.category || typeof productData.category === 'number' ||
                rutaImg1 === undefined || Object.keys(productData).length === 0) {
                CustomError.createError({
                    name: "Error al crear el nuevo producto.",
                    cause: ErrorGenerator.generateProductDataErrorInfo(productData, rutaFrontImg, rutaBackImg),
                    message: "La información para crear el producto está incompleta o no es válida.",
                    code: ErrorEnums.INVALID_PRODUCT_DATA
                });
            }
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            productData.img1 = {
                name: "Img 1",
                reference: `${rutaImg1}`
            };

            productData.img2 = {
                name: "Img 2",
                reference: `${rutaImg2}`,
            };
            const ownerRole = req.user.role;
            let owner = "";
            let email = "";
            let role = ""
            if (ownerRole === "premium") {
                owner = req.user.userID;
                role = req.user.role;
                email = req.user.email;
            } else if (ownerRole === "admin") {
                owner = req.user.role;
                role = req.user.role;
                email = null;
            };
            productData.owner = owner;
            productData.email = email;
            productData.role = role;
            const resultService = await this.productService.createProductService(productData);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                const products = await this.productService.getAllProductsService();
                req.socketServer.sockets.emit('products', products);
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al crear el producto - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async getProductByIDController(req, res, next) {
        const pid = req.params.pid;
        try {
            if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
                CustomError.createError({
                    name: "Error al obtener el producto por ID.",
                    cause: ErrorGenerator.generatePidErrorInfo(pid),
                    message: "El ID de producto proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_PRODUCT_ERROR
                });
            }
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.productService.getProductByIdService(pid);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                const products = await this.productService.getAllProductsService();
                req.socketServer.sockets.emit('products', products);
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener el producto por ID - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async getAllProductsController(req, res, next) {
        let limit = Number(req.limit) || 10;
        let page = Number(req.query.page) || 1;
        let sort = (req.query.sort !== undefined) ? Number(req.query.sort) : 1;
        let filtro = req.query.filtro || null;
        let filtroVal = req.query.filtroVal || null;
        try {
            if (limit === 0 || page === 0 || filtroVal === 0) {
                CustomError.createError({
                    name: "Error al intentar filtrar productos.",
                    cause: ErrorGenerator.generateFilterErrorInfo(),
                    message: "El valor proporcionado para el filtro no es válido.",
                    code: ErrorEnums.INVALID_FILTER_PRODUCT_ERROR
                });
            }
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.productService.getAllProductsService(limit, page, sort, filtro, filtroVal);
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
            response.message = "Error al obtener los productos - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async deleteProductController(req, res, next) {
        const pid = req.params.pid;
        try {
            if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
                CustomError.createError({
                    name: "Error al eliminar el producto por ID.",
                    cause: ErrorGenerator.generatePidErrorInfo(pid),
                    message: "El ID de producto proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_PRODUCT_ERROR
                });
            }
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            if (req.user && req.user.role && req.user.email) {
                const requesterRole = req.user.role;
                const requester = requesterRole === "premium" ? req.user.email : requesterRole === "admin" ? req.user.role : undefined;
                const resultService = await this.productService.deleteProductService(pid, requester);
                response.statusCode = resultService.statusCode;
                response.message = resultService.message;
                if (resultService.statusCode === 500) {
                    req.logger.error(response.message);
                } else if (resultService.statusCode === 404 || resultService.statusCode === 403) {
                    req.logger.warn(response.message);
                } else if (resultService.statusCode === 200) {
                    response.result = resultService.result;
                    const products = await this.productService.getAllProductsService();
                    req.socketServer.sockets.emit('products', products);
                    req.logger.debug(response.message);
                };
            }
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar el producto - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async deleteAllPremiumProductController(req, res, next) {
        const uid = req.params.uid;
        const role = req.user.role;
        let userRequestId;
        if (role !== "admin") {
            userRequestId = req.user.userID;
        }
        try {
            if (!uid || !mongoose.Types.ObjectId.isValid(uid)) {
                CustomError.createError({
                    name: "Error al eliminar todos los productos del usuario premium.",
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
            const resultService = await this.productService.deleteAllPremiumProductService(uid, userRequestId, role);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404 || resultService.statusCode === 403) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                const products = await this.productService.getAllProductsService();
                req.socketServer.sockets.emit('products', products);
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar todos los productos de usuario premium - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    }

    async updatedProductController(req, res, next) {
        const pid = req.params.pid;
        const updatedFields = req.body;
        let rutaImg1;
        let rutaImg2;
        const parteComun = 'public\\';
        if (req.files && req.files.frontImg) {
            const Img1 = req.files.Img1[0].path;
            const indice = Img1.indexOf(parteComun);
            const ruta = Img1.substring(indice + parteComun.length);
            rutaImg1 = ruta
        };
        if (req.files && req.files.Img2) {
            const Img2 = req.files.Img2[0].path;
            const indice = Img2.indexOf(parteComun);
            const ruta = Img2.substring(indice + parteComun.length);
            rutaImg2 = ruta
        };
        parseFloat(updatedFields.price);
        parseFloat(updatedFields.stock);
        try {
            if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
                CustomError.createError({
                    name: "Error al intentar actualizar el producto.",
                    cause: ErrorGenerator.generatePidErrorInfo(pid),
                    message: "El ID de producto proporcionado no es válido",
                    code: ErrorEnums.INVALID_ID_PRODUCT_ERROR
                });
            } else if (!updatedFields || Object.keys(updatedFields).length === 0) {
                let infoUp = JSON.stringify(updatedFields, null, 2);
                CustomError.createError({
                    name: "Error al intentar actualizar el producto.",
                    cause: ErrorGenerator.generateEmptyUpdateFieldsErrorInfo(infoUp),
                    message: "No se proporcionaron campos válidos para la actualización del producto.",
                    code: ErrorEnums.INVALID_UPDATED_PRODUCT_FIELDS
                });
            };
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            if (rutaImg1) {
                updatedFields.img1 = {
                    name: "Img 1",
                    reference: `${rutaImg1}`
                };
            };
            if (rutaImg2) {
                updatedFields.img2 = {
                    name: "Img 2",
                    reference: `${rutaImg2}`,
                };
            };
            const ownerRole = req.user.role;
            const owner = ownerRole === "premium" ? req.user.userID : ownerRole === "admin" ? req.user.role : undefined;
            const resultService = await this.productService.updateProductService(pid, updatedFields, owner);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404 || resultService.statusCode === 403 || resultService.statusCode === 409) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                const products = await this.productService.getAllProductsService();
                req.socketServer.sockets.emit('products', products);
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar el producto - Controller:" + error.message;
            req.logger.error(response.message);
        };
        return response;
    };
}