import UserDAO from "../DAO/mongodb/UserMongo.dao.js";
import ProductService from "../services/products.service.js"
import CartService from '../services/carts.service.js'
import jwt from 'jsonwebtoken';
import Mail from "../email/nodemailer.js";
import config from "../config.js";

export default class SessionService {
    constructor() {
        this.userDAO = new UserDAO();
        this.productService = new ProductService();
        this.cartService = new CartService();
        this.mail = new Mail();
    }

    async uploadPremiumDocsService(uid, documentsRuta, documentNames) {
        let response = {};
        try {
            const resultDAO = await this.userDAO.uploadPremiumDocs(uid, documentsRuta, documentNames);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found user") {
                response.statusCode = 404;
                response.message = "Usuario no encontrado.";
            } else if (resultDAO.status === "parcial success") {
                response.statusCode = 206;
                response.message = `Ya has proporcionado la documentación para ${resultDAO.result1}, sin embargo, la calidad de usuario premium tambien requiere la documentación de ${resultDAO.result2}. Una vez subidos todos los archivos estarás en condiciones de volverte premium.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = `Todos los documentos de ${resultDAO.result} se han cargado exitosamente, ahora estas en condiciones de convertirte en un usuario premium, para completar el proceso solo debes presionar en "Actualizar role", luego de ello puedes verificar el cambio de role en la sección de perfil.`;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al subir documentación de usuario - Service: " + error.message;
        };
        return response;
    };

    async changeRoleService(res, uid, requesterRole) {
        let response = {};
        try {
            const resultDAO = await this.userDAO.getUser(uid);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found user") {
                response.statusCode = 404;
                response.message = `Usuario no encontrado.`;
            } else if (resultDAO.status === "success") {
                let userRole = resultDAO.result.role;
                const newRole = userRole === "user" ? "premium" : "user";
                const updateUser = {
                    role: newRole
                };
                let docsSubidos = resultDAO.result.documents.map(doc => doc.name);
                let documentNames = ["Identificación", "Comprobante de domicilio", "Comprobante de estado de cuenta"];
                let documentosFaltantes = documentNames.filter(name => !docsSubidos.includes(name));
                let resultRolPremium
                let deleteProdPremRes
                if (requesterRole === "admin" && newRole === "premium") {
                    resultRolPremium = await this.userDAO.updateUser(uid, updateUser);
                } else if (requesterRole === "user" && newRole === "premium") {
                    if (docsSubidos.length === 3) {
                        resultRolPremium = await this.userDAO.updateUser(uid, updateUser);
                    } else {
                        resultRolPremium = { status: "incomplete documents" };
                    }
                } else if (newRole === "user") {
                    deleteProdPremRes = await this.productsService.deleteAllPremiumProductService(uid, uid, userRole);
                    if (deleteProdPremRes.statusCode === 200 || deleteProdPremRes.statusCode === 404) {
                        resultRolPremium = await this.userDAO.updateUser(uid, updateUser);
                    };
                };
                if (resultRolPremium.status === "error") {
                    response.statusCode = 500;
                    response.message = resultRolPremium.message;
                } else if (resultRolPremium.status === "incomplete documents") {
                    response.statusCode = 422;
                    response.message = `No es posible efectuar el cambio de role a premium, ya que aún no se ha proporcionado toda la documentación requerida para dicha operación. Los documentos faltantes son  ${documentosFaltantes.join(', ')}.`;
                } else if (resultRolPremium.status === "not found user") {
                    response.statusCode = 404;
                    response.message = "Usuario no encontrado.";
                } else if (resultRolPremium.status === "success") {
                    if (resultRolPremium.status === "success" && newRole === "user") {
                        response.statusCode = 200;
                        response.message = `Usuario actualizado exitosamente, su rol ha sido actualizado a ${newRole}. ${deleteProdPremRes.message}`;
                    } else if (resultRolPremium.status === "success" && newRole === "premium") {
                        response.statusCode = 200;
                        response.message = `Usuario actualizado exitosamente, su rol ha sido actualizado a ${newRole}.`;
                    };
                    if (requesterRole !== "admin") {
                        const newUser = await this.userDAO.getUser(uid);
                        if (newUser.status = "success") {
                            let token = jwt.sign({
                                email: newUser.result.email,
                                first_name: newUser.result.first_name,
                                role: newUser.result.role,
                                cart: newUser.result.cart,
                                userID: newUser.result._id
                            }, config.JWT_SECRET, {
                                expiresIn: '7d'
                            });
                            res.cookie(config.JWT_COOKIE, token, {
                                httpOnly: true,
                                signed: true,
                                maxAge: 7 * 24 * 60 * 60 * 1000
                            })
                        }
                    };
                };
            }
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al modificar el rol del usuario - Service: " + error.message;
        };
        return response;
    };

    async getAllUsersService() {
        let response = {};
        try {
            const resultDAO = await this.userDAO.getAllUsers();
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found users") {
                response.statusCode = 404;
                response.message = "No se han encontrado usuarios.";
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.result = resultDAO.result;
                response.message = `Usuarios obtenidos exitosamente.`;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener los usuarios - Service: " + error.message;
        };
        return response;
    };

    async deleteInactivityUsersService(adminRole) {
        let response = {};
        try {
            const resultDAO = await this.userDAO.deleteInactivityUsers();
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found inactivity users") {
                response.statusCode = 404;
                response.message = "No se han encontrado usuarios inactivos.";
            } else if (resultDAO.status === "success") {
                let cartDeletedError = [];
                let cartDeletedSuccess = [];
                let productsDeletedError = [];
                let productsDeletedSuccess = [];
                let envioExitoso = [];
                let envioFallido = [];
                for (let i = 0; i < resultDAO.result.length; i ++) {
                    const user = resultDAO.result[i];
                    let name = user[0];
                    let email = user[1];
                    let uid = user[2].toString();
                    let cid = user[3].toString();
                    let userRole = user[4];
                    let deleteCart = await this.cartService.deleteCartService(cid);
                    if (deleteCart) {
                        if (deleteCart.statusCode === "error") {
                            cartDeletedError.push(" " + email);
                        } else if (deleteCart.statusCode === 200) {
                            cartDeletedSuccess.push(" " + email)
                        }
                    }
                    if (userRole === "premium") {
                        let deleteUserProducts = await this.productsService.deleteAllPremiumProductService(uid, uid, adminRole);
                        if (deleteUserProducts.statusCode === "error") {
                            productsDeletedError.push(" " + email);
                        } else if (deleteUserProducts.statusCode === 404 || deleteUserProducts.statusCode === 200) {
                            productsDeletedSuccess.push(" " + email)
                        }
                    };
                    const html = `
                    <table cellspacing="0" cellpadding="0" width="100%">
                        <tr>
                            <td style="text-align: center;">
                                <h1>MECATRON REPUESTOS</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="text-align: center;">
                                <h2 style="font-size: 24px; margin: 0;">Notificación de eliminación de cuenta por inactividad</h2>
                                <p style="font-size: 16px;">
                                    Estimado ${name}, lamentamos informarte que tu cuenta ha sido eliminada debido a la inactividad de la misma. Esta acción es necesaria para mantener la calidad y seguridad de nuestra plataforma.
                                </p>
                                <p style="font-size: 16px; font-weight: bold;">
                                    - Fecha y hora de eliminación: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}
                                </p>
                                <p style="font-size: 16px;">
                                    Si tienes alguna pregunta o necesitas asistencia, no dudes en ponerte en contacto con nuestro equipo de soporte.
                                </p>
                                <p style="font-size: 16px;">
                                    Gracias por tu comprensión.
                                </p>
                            </td>
                        </tr>
                    </table>`
                    if (email) {
                        let resultSendMail = await this.mail.sendMail(email, "Notificación de eliminación de cuenta", html);
                        if (resultSendMail.accepted.length > 0) {
                            envioExitoso.push(" " + email);
                        } else if (resultSendMail.rejected && resultSendMail.rejected.length > 0) {
                            envioFallido.push(" " + email);
                        };
                    };
                };
                if (envioFallido.length === 0 && cartDeletedError.length === 0 && productsDeletedError.length === 0) {
                    let result = {};
                    if (envioExitoso.length > 0) {
                        result.envioExitoso = "Usuarios eliminados y notificados:" + envioExitoso + "."
                    }
                    if (cartDeletedSuccess.length > 0) {
                        result.cartDeletedSuccess = "Se han eliminado los carritos de los siguientes usuarios:" + cartDeletedSuccess + "."
                    }
                    if (productsDeletedSuccess.length > 0) {
                        result.productsDeletedSuccess = "Se han eliminado los productos de los siguiente usuarios premium:" + productsDeletedSuccess + "."
                    }
                    response.statusCode = 200;
                    response.message = "Usuarios inactivos eliminados exitosamente.";
                    response.result = result
                } else if (envioFallido.length > 0 || cartDeletedError.length > 0 || productsDeletedError.length > 0) {
                    let result = {}
                    if (envioExitoso.length > 0) {
                        result.envioExitoso = "Usuarios eliminados y notificados:" + envioExitoso + "."
                    }
                    if (cartDeletedSuccess.length > 0) {
                        result.cartDeletedSuccess = "Se han eliminado los carritos de los siguientes usuarios:" + cartDeletedSuccess + "."
                    }
                    if (productsDeletedSuccess.length > 0) {
                        result.productsDeletedSuccess = "Se han eliminado los productos de los siguiente usuarios premium:" + productsDeletedSuccess + "."
                    }
                    if (envioFallido.length > 0) {
                        result.usersNotNotified = "Usuarios elminimados y no se han sido notificados:" + envioFallido + "."
                    }
                    if (cartDeletedError.length > 0) {
                        result.cartDeletedError = "Usuarios cuyos carrito no se ha podido eliminar:" + cartDeletedError + "."
                    }
                    if (productsDeletedError.length > 0) {
                        result.productsDeletedError = "Usuarios cuyos productos no se ha podido eliminar:" + productsDeletedError + "."
                    }
                    response.statusCode = 500;
                    response.message = "Ha ocurrido un error en la eliminacion de uno o mas usuarios.";
                    response.result = result;
                };
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar usuarios inactivos - Service: " + error.message;
        };
        return response;
    };
};