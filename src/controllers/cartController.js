import CartService from "../services/carts.service.js";
import mongoose from "mongoose";

import ErrorEnums from "../errors/error.enums.js";
import CustomError from "../errors/customError.class.js";
import ErrorGenerator from "../errors/error.info.js";

export default class CartController {
    constructor() {
        this.cartService = new CartService()
    }
    // Métodos CartController:
    async createCartController(req, res) {
        let response = {};
        try {
            const resultService = await this.cartService.createCartService();
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            }
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al crear el carrito - Controller: " + error.message;
            req.logger.error(response.message);
        }
        return response;
    }

    async getCartByIdController(req, res, next) {
        const cid = req.params.cid;
        try {
            if (!cid || !mongoose.Types.ObjectId.isValid(cid)) {
                CustomError.createError({
                    name: "Error al Obtener Carrito por ID.",
                    cause: ErrorGenerator.generateCidErrorInfo(cid),
                    message: "El ID de Carrito Proporcionado no es Válido.",
                    code: ErrorEnums.INVALID_ID_CART_ERROR
                });
            };
        } catch (error) {
            return next(error)
        };
        let response = {};
        try {
            const resultService = await this.cartService.getCartByIdService(cid);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            }
        } catch (error) {
            response.statusCode = 500;
            response.message = 'Error al obtener el carrito por ID - Controller: ' + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async getAllCartsController(req, res) {
        let response = {};
        try {
            const resultService = await this.cartService.getAllCartsService();
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
            response.message = 'Error al obtener los carritos - Controller: ' + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async addProductInCartController(req, res, next) {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const quantity = req.params.quantity;
        try {
            if (!cid || !mongoose.Types.ObjectId.isValid(cid) || !pid || !mongoose.Types.ObjectId.isValid(pid)) {
                CustomError.createError({
                    name: "Error al intentar agregar un producto al carrito.",
                    cause: ErrorGenerator.generateCidOrPidErrorInfo(cid, pid),
                    message: "El ID de carrito o de producto no tiene un formato válido.",
                    code: ErrorEnums.INVALID_ID_CART_OR_PRODUCT_ERROR
                });
            } else if (!quantity || isNaN(quantity) || quantity <= 0) {
                CustomError.createError({
                    name: "Error al intentar agregar un producto al carrito.",
                    cause: ErrorGenerator.generateQuantityErrorInfo(quantity),
                    message: "La cantidad debe ser un número válido y mayor que cero.",
                    code: ErrorEnums.QUANTITY_INVALID_ERROR
                });
            };
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const userId = req.user.userID;
            const resultService = await this.cartService.addProductToCartService(cid, pid, quantity, userId);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404 || resultService.statusCode === 401) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            }
        } catch (error) {
            response.statusCode = 500;
            response.message = 'Error al agregar el producto al carrito - Controller: ' + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async purchaseOrderController(req, res, next) {
        const cid = req.params.cid;
        let response = {};
        try {
            const resultService = await this.cartService.purchaseOrderService(req, res, cid);
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
            response.message = "Error al generar orden de compra - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    }
    
    async purchaseSuccessController(req, res, next) {
        const cid = req.params.cid;
        const email = req.user.email;
        const order = req.signedCookies[envPurchaseOrder];
        try {
            if (order.successfulProducts.length > 0) {
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
                            name: "El pago ya se ha recibido, pero ha ocurrito un error en al procesar la compra en la plataforma.",
                            cause: ErrorGenerator.generateProductOrderEInfo(product.product),
                            message: "Los datos del producto estan incompletos o no son validos.",
                            code: ErrorEnums.INVALID_PRODUCT_ORDER_DATA
                        });
                    }
                }
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                CustomError.createError({
                    name: "Error al Procesar la Compra de Productos en el Carrito.",
                    cause: ErrorGenerator.generateEmailUserErrorInfo(email),
                    message: "Correo electrónico inválido.",
                    code: ErrorEnums.INVALID_EMAIL,
                })
            };
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.cartService.purchaseSuccessService(cid, order, email);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                res.cookie(envPurchaseOrder, "", {
                    httpOnly: true,
                    signed: true,
                    maxAge: 1 * 60 * 1000
                });
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al procesar la compra - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async deleteProductFromCartController(req, res, next) {
        const cid = req.params.cid;
        const pid = req.params.pid;
        try {
            if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
                CustomError.createError({
                    name: "Error al obtener el producto por ID.",
                    cause: ErrorGenerator.generatePidErrorInfo(pid),
                    message: "El ID de producto proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_PRODUCT_ERROR
                });
            };
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.cartService.deleteProductFromCartService(cid, pid);
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
            response.message = "Error al eliminar producto del carrito - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async deleteAllProductsFromCartController(req, res, next) {
        const cid = req.params.cid;
        let response = {};
        try {
            const resultService = await this.cartService.deleteAllProductFromCartService(cid);
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
            response.message = "Error al eliminar todos los productos del carrito - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async updateCartController(req, res, next) {
        const cid = req.params.cid;
        const updatedCartFields = req.body;
        try {
            if (updatedCartFields.tickets) {
                CustomError.createError({
                    name: "Error al intentar actualizar el carrito.",
                    cause: ErrorGenerator.generateUpdatedCartForbiddenErrorInfo(),
                    message: "El cuerpo para el carrito, no es válido.",
                    code: ErrorEnums.FORBIDDEN_UPDATED_CART_FIELDS
                })
            } else if (!updatedCartFields.products || !Array.isArray(updatedCartFields.products) || updatedCartFields.products.length === 0) {
                const updCartFields = JSON.stringify(updatedCartFields, null, 2);
                CustomError.createError({
                    name: "Error al intentar actualizar el carrito.",
                    cause: ErrorGenerator.generateUpdatedCartFieldsErrorInfo(updCartFields),
                    message: "No se proporcionó ningún cuerpo para el carrito.",
                    code: ErrorEnums.INVALID_UPDATED_CART_FIELDS
                })
            };
            const invalidProducts = updatedCartFields.products.some((product) => {
                return !product.product || typeof product.quantity !== "number";
            });
            if (invalidProducts) {
                CustomError.createError({
                    name: "Error al intentar actualizar el carrito.",
                    cause: ErrorGenerator.generateUpdatedCartFieldsErrorInfo2(),
                    message: "Datos de producto incompleto.",
                    code: ErrorEnums.INVALID_UPDATED_CART_FIELDS
                });
            };
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.cartService.updateCartService(cid, updatedCartFields);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404 || resultService.statusCode === 409) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar el carrito - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async updateProductInCartController(req, res, next) {
        const cid = req.params.cid;
        const pid = req.params.pid;
        const quantity = req.body.quantity;
        try {
            if (!pid || !mongoose.Types.ObjectId.isValid(pid)) {
                CustomError.createError({
                    name: "Error al obtener el producto por ID.",
                    cause: ErrorGenerator.generatePidErrorInfo(pid),
                    message: "El ID de producto proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_PRODUCT_ERROR
                });
            } else if (!quantity || !Number.isFinite(quantity)) {
                CustomError.createError({
                    name: "Error al intentar actualizar el producto en carrito",
                    cause: ErrorGenerator.generateUpdatesProdInCartErrorInfo(quantity),
                    message: "No se proporcionó ningún quantity para el producto en carrito.",
                    code: ErrorEnums.INVALID_UPTATED_PROD_IN_CART
                })
            };
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.cartService.updateProductInCartService(cid, pid, quantity);
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
            response.message = "Error al actualizar el producto en el carrito - Controller:" + error.message;
            req.logger.error(response.message);
        };
        return response;
    };

    async deleteCartController(req, res, next) {
        const cid = req.params.cid;
        try {
            if (!cid || !mongoose.Types.ObjectId.isValid(cid)) {
                CustomError.createError({
                    name: "El formato del ID de carrito es incorrecto.",
                    cause: ErrorGenerator.generateCidErrorInfo(cid),
                    message: "El ID de carrito proporcionado no es válido.",
                    code: ErrorEnums.INVALID_ID_CART_ERROR
                });
            };
        } catch (error) {
            return next(error);
        };
        let response = {};
        try {
            const resultService = await this.cartService.deleteCartService(cid);
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 500) {
                req.logger.error(response.message);
            } else if (resultService.statusCode === 404 || resultService.statusCode === 409) {
                req.logger.warn(response.message);
            } else if (resultService.statusCode === 200) {
                response.result = resultService.result;
                req.logger.debug(response.message);
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar el carrito - Controller: " + error.message;
            req.logger.error(response.message);
        };
        return response;
    };
}