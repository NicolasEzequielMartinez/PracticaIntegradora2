import CartDAO from "../DAO/mongodb/CartMongo.dao.js";
import ProductService from "./products.service.js";
import TicketService from "./tickets.service.js";
import config from "../config.js";

export default class CartService {
    constructor() {
        this.cartDao = new CartDAO();
        this.productService = new ProductService();
        this.ticketService = new TicketService();
    }

    // Métodos CartService:
    async createCartService() {
        let response = {};
        try {
            const resultDAO = await this.cartDao.createCart();
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Carrito creado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al crear el carrito - Service: " + error.message;
        };
        return response;
    };

    async getCartByIdService(cid) {
        let response = {};
        try {
            const resultDAO = await this.cartDao.getCartById(cid);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found cart") {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con ID ${cid}.`;
            } else if (resultDAO.status === "success" && resultDAO.delete) {
                response.statusCode = 200;
                if (resultDAO.delete === 1) {
                    response.message = `${resultDAO.delete} producto que tenias en tu carrito ha sido retirado o eliminado de la plataforma.`;
                } else {
                    response.message = `${resultDAO.delete} de los productos que tenías en tu carrito han sido retirados o eliminados de la plataforma.`;
                }
                response.result = resultDAO.result;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Carrito obtenido exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener el carrito por ID - Service: " + error.message;
        };
        return response;
    };

    async getAllCartsService() {
        let response = {};
        try {
            const resultDAO = await this.cartDao.getAllCarts();
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found carts") {
                response.statusCode = 404;
                response.message = "No se han encontrado carritos.";
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Carritos obtenidos exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener los carritos - Service: " + error.message;
        };
        return response;
    };

    async addProductToCartService(cid, pid, quantity, userId) {
        let response = {}
        try {
            const product = await this.productService.getProductByIdService(pid);
            if (product.statusCode === 500 || product.statusCode === 404) {
                response.statusCode = product.statusCode;
                response.message = product.message;
            } else if (product.statusCode === 200) {
                if (product.result.owner === "admin" || product.result.owner !== userId) {
                    const resultDAO = await this.cartDao.addProductToCart(cid, product.result, quantity);
                    if (resultDAO.status === "error") {
                        response.statusCode = 500;
                        response.message = resultDAO.message;
                    } else if (resultDAO.status === "not found cart") {
                        response.statusCode = 404;
                        response.message = `No se encontró ningún carrito con ID ${cid}.`;
                    } else if (resultDAO.status === "success") {
                        response.statusCode = 200;
                        response.message = "Producto agregado al carrito exitosamente.";
                        response.result = resultDAO.result;
                    };
                } else if (product.result.owner === userId) {
                    response.statusCode = 403;
                    response.message = "No puedes agregar tus propios productos a tu carrito.";
                }
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al agregar el producto al carrito - Service: " + error.message;
        };
        return response;
    };

    async purchaseOrderService(req, res, cid) {
        let response = {};
        try {
            const cart = await this.getCartByIdService(cid);
            if (cart.statusCode === 500) {
                response.statusCode = 500;
                response.message = cart.message;
            } else if (cart.statusCode === 404) {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con ID ${cid}.`;
            } else if (cart.statusCode === 200) {
                const products = cart.result.products
                if (products.length === 0) {
                    response.statusCode = 404;
                    response.message = `No se encontró ningún producto en el carrito con ID ${cid}.`;
                }
                if (products.length > 0) {
                    const successfulProducts = [];
                    const failedProducts = [];
                    let amount = 0;
                    for (const product of products) {
                        const pid = product.product._id;
                        const quantity = product.quantity;
                        const productInDB = await this.productService.getProductByIdService(pid);
                        if (productInDB.statusCode === 404 || productInDB.statusCode === 500) {
                            failedProducts.push(product);
                        }
                        else if (productInDB.result.stock < quantity) {
                            failedProducts.push(product);
                        }
                        else if (productInDB.result.stock >= quantity) {
                            successfulProducts.push(product);
                            amount += productInDB.result.price * quantity;
                        };
                    };
                    let order = {
                        successfulProducts,
                        failedProducts,
                        amount
                    };
                    res.cookie(config.PURCHASE_ORDER, order, {
                        httpOnly: true,
                        signed: true,
                        maxAge: 10 * 60 * 1000
                    });
                    response.statusCode = 200;
                    response.message = "Orden de compra generada exitosamente.";
                    response.result = order;
                }
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al generar orden de compra - Service: " + error.message;
        };
        return response;
    }

    async purchaseSuccessService(cid, order, email) {
        order.email = email;
        let response = {};
        try {
            let errorsStock = [];
            let errorsCart = [];
            for (let product of order.successfulProducts) {
                let DBProductID = product.product._id;
                let cartProductID = product._id;
                let quantity = product.quantity;
                const productFromDB = await this.productService.getProductByIdService(DBProductID);
                const updatedProduct = {
                    stock: productFromDB.result.stock - quantity
                };
                const updateStock = await this.productService.updateProductService(DBProductID, updatedProduct, "stock");
                if (updateStock.statusCode === 500 || updateStock.statusCode === 404) {
                    errorsStock.push("Error al actualizar stock del producto, " + product.product.title + "." + updateStock.message);
                }
                const updateCart = await this.deleteProductFromCartService(cid, cartProductID);
                if (updateCart.statusCode === 500 || updateCart.statusCode === 404) {
                    errorsCart.push("Error al actualizar carrito con el producto, " + product.product.title + "." + updateCart.message);
                }
            };
            if (errorsStock.length === 0 && errorsCart.length === 0) {
                const ticketInfo = {
                    successfulProducts: order.successfulProducts.map(product => ({
                        product: product.product._id,
                        quantity: product.quantity,
                        title: product.product.title,
                        price: product.product.price,
                    })),
                    failedProducts: order.failedProducts.map(product => ({
                        product: product.product._id,
                        quantity: product.quantity,
                        title: product.product.title,
                        price: product.product.price,
                    })),
                    purchase: order.email,
                    amount: order.amount
                };
                const ticketServiceResponse = await this.ticketService.createTicketService(ticketInfo);
                if (ticketServiceResponse.statusCode === 500) {
                    response.statusCode = 500;
                    response.message = ticketServiceResponse.message;
                }
                else if (ticketServiceResponse.statusCode === 200) {
                    const tid = ticketServiceResponse.result._id;
                    const resultDAO = await this.cartDao.addTicketToCart(cid, tid);
                    if (resultDAO.status === "not found cart") {
                        response.statusCode = 404;
                        response.message = `No se encontró ningún carrito con el ID ${cid}.`;
                    } else if (resultDAO.status === "error") {
                        response.statusCode = 500;
                        response.message = resultDAO.message;
                    } else if (resultDAO.status === "success") {
                        response.statusCode = 200;
                        response.message = "Compra procesada exitosamente. El ticket ya ha sido agregado al carrito.";
                        response.result = ticketServiceResponse.result;
                    };
                };
            }  else if (errorsStock.length > 0 && errorsCart.length > 0) {
                response.statusCode = 500;
                response.message = 'Error al procesar la compra: ' + JSON.stringify(errorsStock, null, 2) || JSON.stringify(errorsCart, null, 2);
            }
        } catch (error) {
            response.statusCode = 500;
            response.message = 'Error al procesar la compra - Service: ' + error.message;
        };
        return response;
    };

    async deleteProductFromCartService(cid, pid) {
        let response = {};
        try {
            const resultDAO = await this.cartDao.deleteProductFromCart(cid, pid);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found cart") {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "not found product") {
                response.statusCode = 404;
                response.message = `No se encontró ningún producto con el ID ${pid}, en el carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Producto eliminado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al borrar el producto en carrito - Service: " + error.message;
        };
        return response;
    };

    async deleteAllProductFromCartService(cid) {
        let response = {};
        try {
            const resultDAO = await this.cartDao.deleteAllProductsFromCart(cid);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found cart") {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "not found prod") {
                response.statusCode = 404;
                response.message = `No se encontraron productos en el carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Los productos del carrito se han eliminado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar todos los productos del carrito - Service: " + error.message;
        };
        return response;
    };

    async updateCartService(cid, updatedCartFields) {
        const response = {};
        try {
            const resultDAO = await this.cartDao.updateCart(cid, updatedCartFields)
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found cart") {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "update is equal to current") {
                response.statusCode = 409;
                response.message = `La actualización es igual a la versión actual de los datos del carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Carrito actualizado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar el carrito - Service: " + error.message;
        };
        return response;
    };

    async updateProductInCartService(cid, pid, quantity) {
        let response = {};
        try {
            const resultDAO = await this.cartDao.updateProductInCart(cid, pid, quantity)
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found cart") {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "not found product") {
                response.statusCode = 404;
                response.message = `No se encontró ningún producto con el ID ${pid}, en el carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Producto actualizado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar el producto en el carrito - Service: " + error.message;
        };
        return response;
    };

    async deleteCartService(cid) {
        let response = {};
        try {
            const resultDAO = await this.cartDao.deleteCart(cid)
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found cart") {
                response.statusCode = 404;
                response.message = `No se encontró ningún carrito con el ID ${cid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Carrito eliminado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar el carrito - Service: " + error.message;
        };
        return response;
    };

};