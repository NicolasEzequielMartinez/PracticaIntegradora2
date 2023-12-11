import ProductsDAO from "../DAO/mongodb/ProductsMongo.dao.js";
import Mail from '../email/nodemailer.js'

export default class ProductService {
    constructor() {
        this.productDao = new ProductsDAO();
        this.mail = new Mail();
    };
    
    async createProductService(info) {
        let response = {};
        try {
            const resultDAO = await this.productDao.createProduct(info);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Producto creado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al crear el producto - Service: " + error.message;
        };
        return response;
    };

    async getProductByIdService(pid) {
        let response = {};
        try {
            const resultDAO = await this.productDao.getProductById(pid);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found product") {
                response.statusCode = 404;
                response.message = `No se encontró ningún producto con el ID ${pid}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Producto obtenido exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener el producto por ID - Service: " + error.message;
        };
        return response;
    };

    async getAllProductsService(limit, page, sort, filtro, filtroVal) {
        let response = {};
        try {
            const resultDAO = await this.productDao.getAllProducts(limit, page, sort, filtro, filtroVal);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found products") {
                response.statusCode = 404;
                response.message = `No se encontraron productos.`
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Productos obtenidos exitosamente.";
                response.result = resultDAO.result.products;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener los productos - Service: " + error.message;
        };
        return response;
    };

    async deleteProductService(pid, requester) {
        let response = {};
        try {
            const productInfo = await this.productDao.getProductById(pid);
            if (productInfo.status === "error") {
                response.statusCode = 500;
                response.message = productInfo.message;
            } else if (productInfo.status === "not found product") {
                response.statusCode = 404;
                response.message = `No se encontro ningún producto con el ID ${pid}.`;
            } else if (productInfo.status === "success") {
                if (requester === "admin" || productInfo.result.email === requester) {
                    const resultDAO = await this.productDao.deleteProduct(pid);
                    if (resultDAO.status === "error") {
                        response.statusCode = 500;
                        response.message = resultDAO.message;
                    } else if (resultDAO.status === "not found product") {
                        response.statusCode = 404;
                        response.message = `No se encontró ningún producto con el ID ${pid}.`;
                    } else if (resultDAO.status === "success") {
                        if (requester === "admin" && productInfo.result.email === null) {
                            response.statusCode = 200;
                            response.message = "Producto eliminado exitosamente.";
                            response.result = resultDAO.result;
                        } else if (productInfo.result.email === requester) {
                            response.statusCode = 200;
                            response.message = "Producto eliminado exitosamente.";
                            response.result = resultDAO.result;
                        } else if (requester === "admin" && productInfo.result.email !== null) {
                            let html = `
                                <table cellspacing="0" cellpadding="0" width="100%">
                                    <tr>
                                        <h1>MECATRON REPUESTOS</h1>
                                    </tr>
                                    <tr>
                                        <td style="text-align: center;">
                                            <h2 style="font-size: 24px; margin: 0;">Notificación de eliminación de producto:</h2>
                                            <p style="font-size: 16px;">
                                            Estimado usuario, queremos informarte que uno de tus productos publicados en nuestra plataforma ha sido eliminado debido a un incumplimiento de nuestras políticas y directrices. Queremos garantizar que nuestra plataforma sea un lugar seguro y confiable para todos los usuarios, por lo que debemos tomar medidas para mantener la integridad de los productos listados.
                                            </p>
                                            <p style="font-size: 16px; font-weight: bold;">
                                            Detalles del producto eliminado:
                                            </p>
                                            <p style="font-size: 16px; font-weight: bold;">
                                            - Nombre del producto: ${productInfo.result.title}
                                            </p>
                                            <p style="font-size: 16px; font-weight: bold;">
                                            - Fecha y hora de eliminación: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()} </p>
                                            <p style="font-size: 16px;">Lamentamos que esta acción haya sido necesaria, pero es fundamental para mantener la calidad y seguridad de nuestra plataforma para todos los usuarios. Gracias por tu comprensión y para cualquier consulta, no dudes en ponerte en contacto con nuestro equipo de soporte.</p>
                                        </td>
                                    </tr>
                                </table>`;
                            const resultSendMail = await this.mail.sendMail(productInfo.result.email, "Notificación de eliminación de producto", html);
                            if (resultSendMail.accepted.length > 0) {
                                response.statusCode = 200;
                                response.message = "Producto eliminado y correo de notificación enviado al usuario premium exitosamente.";
                                response.result = resultDAO.result;
                            } else if ((resultSendMail.rejected && resultSendMail.rejected.length > 0)) {
                                response.statusCode = 500;
                                response.message = "Error al enviar el correo electrónico. Por favor, inténtelo de nuevo más tarde.";
                            };
                        }
                    }
                } else {
                    response.statusCode = 403;
                    response.message = "Solo puedes eliminar los productos que te pertenecen.";
                };
            }
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar el producto - Service: " + error.message;
        };
        return response;
    };

    async deleteAllPremiumProductService(uid, userRequestId, role) {
        let response = {};
        try {
            if (role === "admin" || uid === userRequestId) {
                const resultDAO = await this.productDao.deleteAllPremiumProduct(uid, role);
                if (resultDAO.status === "error") {
                    response.statusCode = 500;
                    response.message = resultDAO.message;
                } else if (resultDAO.status === "not found products") {
                    response.statusCode = 404;
                    response.message = `No se encontraron productos asociados a esta cuenta.`;
                } else if (resultDAO.status === "success") {
                    if (!resultDAO.userEmail) {
                        response.statusCode = 200;
                        response.message = resultDAO.message
                    } else if (resultDAO.userEmail) {
                        let html = `
                        <table cellspacing="0" cellpadding="0" width="100%">
                            <tr>
                                <td style="text-align: center;">
                                    <h1>MECATRON REPUESTOS</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="text-align: center;">
                                <h2 style="font-size: 24px; margin: 0;">Notificación de eliminación de producto:</h2>
                                <p style="font-size: 16px;">
                                    Estimado usuario, queremos informarte que los productos que has publicado en nuestra plataforma han sido eliminado debido a un incumplimiento de nuestras políticas y directrices. Queremos garantizar que nuestra plataforma sea un lugar seguro y confiable para todos los usuarios, por lo que debemos tomar medidas para mantener la integridad de los productos listados.
                                </p>
                                </td>
                            </tr>
                            <tr display: flex; justify-content: center; align-items: center; flex-direction: column;>
                                <td style="text-align: center;">
                                <p style="font-size: 16px; font-weight: bold;">Productos eliminados:</p>
                                
                            `;
                        resultDAO.deletedProducts.forEach((productName) => {
                            html += `<p style="font-size: 16px;"> - ${productName}</p>`;
                        });
                        html += `
                                <p style="font-size: 16px; font-weight: bold;">Fecha y hora de eliminación: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}</p>
                                <p style="font-size: 16px;">Lamentamos que esta acción haya sido necesaria, pero es fundamental para mantener la calidad y seguridad de nuestra plataforma para todos los usuarios. Gracias por tu comprensión y para cualquier consulta, no dudes en ponerte en contacto con nuestro equipo de soporte.</p>
                                </td>
                            </tr>
                        </table>
                        `;
                        const resultSendMail = await this.mail.sendMail(resultDAO.userEmail, "Notificación de eliminación de producto", html);
                        if (resultSendMail.accepted.length > 0) {
                            response.statusCode = 200;
                            response.message = "Productos eliminados y correo de notificación enviado al usuario premium exitosamente.";
                            response.result = resultDAO.result;
                        } else if (resultSendMail.rejected && resultSendMail.rejected.length > 0) {
                            response.statusCode = 500;
                            response.message = "Error al enviar el correo electrónico. Por favor, inténtelo de nuevo más tarde.";
                        };
                    }
                };
            } else { 
                response.statusCode = 403;
                response.message = "Solo puedes eliminar los productos que te pertenecen.";
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar todos los productos de usuario premium - Service: " + error.message;
        };
        return response;
    };

    async updateProductService(pid, updateProduct, owner) {
        let response = {};
        try {
            const productInfo = await this.productDao.getProductById(pid);
            if (productInfo.status === "error") {
                response.statusCode = 500;
                response.message = productInfo.message;
            } else if (productInfo.status === "not found product") {
                response.statusCode = 404;
                response.message = `No se encontró ningún producto con el ID ${pid}.`;
            } else if (productInfo.status === "success") {
                if (owner === "stock"){
                    const resultDAO = await this.productDao.updateProduct(pid, updateProduct);
                    if (resultDAO.status === "error") {
                        response.statusCode = 500;
                        response.message = resultDAO.message;
                    } else if (resultDAO.status === "not found product") {
                        response.statusCode = 404;
                        response.message = `No se encontró ningún producto con el ID ${pid}.`;
                    } else if (resultDAO.status === "success") {
                        response.statusCode = 200;
                        response.message = "Producto actualizado exitosamente.";
                        response.result = "Stock actualizado."
                    };
                }
                if (owner === "admin" && productInfo.result.owner === "admin" || productInfo.result.owner === owner) {
                    const resultDAO = await this.productDao.updateProduct(pid, updateProduct);
                    if (resultDAO.status === "error") {
                        response.statusCode = 500;
                        response.message = resultDAO.message;
                    } else if (resultDAO.status === "not found product") {
                        response.statusCode = 404;
                        response.message = `No se encontró ningún producto con el ID ${pid}.`;
                    } else if (resultDAO.status === "update is equal to current") {
                        response.statusCode = 409;
                        response.message = 'La actualización es igual a la versión actual de los datos del producto.'
                    } else if (resultDAO.status === "success") {
                        response.statusCode = 200;
                        response.message = "Producto actualizado exitosamente.";
                        response.result = resultDAO.result;
                    };
                } else {
                    response.statusCode = 403;
                    response.message = "Solo puedes modificar los productos que te pertenecen.";
                };
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar el producto - Service: " + error.message;
        };
        return response;
    };

};