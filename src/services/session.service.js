import SessionDAO from "../DAO/mongodb/SessionMongo.dao.js";
import CartService from "./carts.service.js";
import ProductService from "./products.service.js";
import Mail from '../email/nodemailer.js'
import jwt from 'jsonwebtoken';
import { createHash, isValidPassword } from "../utils.js";
import config from "../config.js";

export default class SessionService {
    constructor() {
        this.sessionDAO = new SessionDAO();
        this.cartService = new CartService();
        this.productsService = new ProductService();
        this.mail = new Mail()
    }
    // Métodos UserService:
    async createUserService(info) {
        let response = {};
        try {
            const resultDAO = await this.sessionDAO.createUser(info);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Usuario registrado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al registrar al usuario - Service: " + error.message;
        };
        return response;
    };

    async getUserService(identifier) {
        let response = {};
        try {
            const resultDAO = await this.sessionDAO.getUser(identifier);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found user") {
                response.statusCode = 404;
                response.message = `No se encontró ningún usuario con el Email, Nombre o ID, ${identifier}.`;
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Usuario obtenido exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener el usuario - Service: " + error.message;
        };
        return response;
    }

    async updateUserSevice(uid, updateUser) {
        let response = {};
        try {
            const resultDAO = await this.sessionDAO.updateUser(uid, updateUser);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found user") {
                response.statusCode = 404;
                response.message = "Usuario no encontrado.";
            } else if (resultDAO.status === "success") {
                response.statusCode = 200;
                response.message = "Usuario actualizado exitosamente.";
                response.result = resultDAO.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar los datos del usuario - Service: " + error.message;
        };
        return response;
    };

    async getUserAndSendEmailService(email) {
        let response = {};
        try {
            const resultDAO = await this.sessionDAO.getUser(email);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found user") {
                response.statusCode = 404;
                response.message = `No se encontró ninguna cuenta asociada a este correo, ${email}.`;
            } else if (resultDAO.status === "success") {
                const user = resultDAO.result;
                let token = jwt.sign({
                    email
                }, config.RESET_PASSWORD_TOKEN, {
                    expiresIn: '1h'
                })
                let html = `
                <table cellspacing="0" cellpadding="0" width="100%">
                    <tr>
                        <td style="text-align: center;">
                            <h1>MECATRON REPUESTOS</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="text-align: center;">
                        <h2 style="font-size: 24px; margin: 0;">Enlace para restablecimiento de contraseña:</h2>
                            <p style="font-size: 16px;">
                            Haga click en el siguiente enlace para restablecer su contraseña:</p>
                            <a href="${config.URL_REST_PASS}${token}" 
                            style="
                            background-color: #95d0f7;
                            color: #002877; 
                            text-decoration: none;
                            padding: 10px 20px; 
                            border-radius: 1em; 
                            font-size: 16px; 
                            margin: 10px 0; 
                            display: inline-block;"
                            >Restablecer contraseña</a>
                            <p style="font-size: 16px; font-weight: bold;">IMPORTANTE: La validez de este enlace es de 1 hora. Una vez que haya pasado este período, el enlace te llevará automáticamente a la página de "Restablecer Contraseña - Solicitar Correo", donde podrás solicitar uno nuevo.</p>
                            <p style="font-size: 16px;">Gracias, ${user.first_name}.</p>
                            <p style="font-size: 16px;">Para cualquier consulta, no dudes en ponerte en contacto con nuestro equipo de soporte.</p>
                            </td>
                    </tr>
                </table>`;
                const resultSendMail = await this.mail.sendMail(user.email, "Restablecimiento de contraseña.", html);
                if (resultSendMail.accepted.length > 0) {
                    response.statusCode = 200;
                    response.message = "Correo enviado exitosamente.";
                    response.result = resultSendMail;
                } else if (resultSendMail.rejected && resultSendMail.rejected.length > 0){
                    response.statusCode = 500;
                    response.message = "Error al enviar el correo electrónico. Por favor, inténtelo de nuevo más tarde.";
                };
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al enviar email para restablecer contraseña - Service: " + error.message;
        };
        return response;
    };

    async resetPassUser(userEmail, newPass) {
        let response = {
            userEmail
        };
        try {
            const resultDAO = await this.sessionDAO.getUser(userEmail);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found user") {
                response.statusCode = 404;
                response.message = `No se encontró ninguna cuenta asociada a este correo, ${userEmail}.`;
            } else if (resultDAO.status === "success") {
                const user = resultDAO.result
                if (isValidPassword(user, newPass)) {
                    response.statusCode = 400;
                    response.message = `La nueva contraseña que has proporcionado es idéntica a tu contraseña actual. Para restablecer la contraseña, por favor introduce una contraseña diferente. Si prefieres mantener tu contraseña actual, puedes iniciar sesión utilizando tus credenciales habituales haciendo clic en "Iniciar sesión".`;
                } else {
                    const password = createHash(newPass);
                    const updateUser = {
                        password
                    };
                    const resultUpdt = await this.sessionDAO.updateUser(user._id, updateUser);
                    if (resultUpdt.status === "error") {
                        response.statusCode = 500;
                        response.message = resultUpdt.message;
                    } else if (resultUpdt.status === "not found user") {
                        response.statusCode = 404;
                        response.message = "Usuario no encontrado.";
                    } else if (resultUpdt.status === "success") {
                        response.statusCode = 200;
                        response.message = "Usuario actualizado exitosamente.";
                        response.result = resultUpdt.result;
                    };
                };
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al restablecer contraseña - Service: " + error.message;
        };
        return response;
    };

    async updateProfileSevice(req, res, uid, updateProfile) {
        let response = {};
        try {
            const resultDAO = await this.sessionDAO.updateUser(uid, updateProfile);
            if (resultDAO.status === "error") {
                response.statusCode = 500;
                response.message = resultDAO.message;
            } else if (resultDAO.status === "not found user") {
                response.statusCode = 404;
                response.message = "Usuario no encontrado.";
            } else if (resultDAO.status === "success") {
                const newUser = await this.sessionDAO.getUser(uid);
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
                    response.statusCode = 200;
                    response.message = "Usuario actualizado exitosamente.";
                }
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al actualizar los datos del usuario - Service: " + error.message;
        };
        return response;
    };


    async logoutService(req, res, uid) {
        let response = {};
        try {
            if (uid !== null) {
                const lastConnection = {
                    last_connection: new Date().toLocaleDateString() + " - " + new Date().toLocaleTimeString()
                };
                const resultUpdt = await this.sessionDAO.updateUser(uid, lastConnection);
                if (resultUpdt.status === "error") {
                    response.statusCode = 500;
                    response.message = resultUpdt.message;
                } else if (resultUpdt.status === "not found user") {
                    response.statusCode = 404;
                    response.message = "Usuario no encontrado.";
                } else if (resultUpdt.status === "success") {
                    res.cookie(config.JWT_COOKIE, "", {
                        httpOnly: true,
                        signed: true,
                        maxAge: 7 * 24 * 60 * 60 * 1000
                    })
                    response.statusCode = 200;
                    response.message = "Session cerrada exitosamente.";
                };
            } else if (uid === null) {
                res.cookie(config.JWT_COOKIE, "", {
                    httpOnly: true,
                    signed: true,
                    maxAge: 7 * 24 * 60 * 60 * 1000
                })
                response.statusCode = 200;
                response.message = "Session cerrada exitosamente.";
            }
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al cerrar session - Service: " + error.message;
        };
        return response;
    };

    async deleteUserService(uid, role) {
        let response = {};
        try {
            let cid;
            let email;
            let name;
            const userInfo = await this.getUserService(uid)
            if (userInfo.statusCode === 500) {
                response.statusCode = 500;
                response.message = userInfo.message;
            } else if (userInfo.statusCode === 404) {
                response.statusCode = 404;
                response.message = `No se encontró ningún usuario con el ID, ${uid}.`;
            } else if (userInfo.statusCode === 200) {
                cid = userInfo.result.cart;
                email = userInfo.result.email;
                name = userInfo.result.first_name;
                const resultDAO = await this.sessionDAO.deleteUser(uid);
                if (resultDAO.status === "error") {
                    response.statusCode = 500;
                    response.message = resultDAO.message;
                } else if (resultDAO.status === "not found user") {
                    response.statusCode = 404;
                    response.message = `No se encontró ninguna cuenta con este ID, ${uid}.`;
                } else if (resultDAO.status === "success") {
                    const deleteCart = await this.cartService.deleteCartService(cid);
                    const deleteUserProducts = await this.productsService.deleteAllPremiumProductService(uid, uid, role);
                    let errorCorreo;
                    if (role === "admin") {
                        let html = `
                        <table cellspacing="0" cellpadding="0" width="100%">
                            <tr>
                                <h1>MECATRON</h1>
                            </tr>
                            <tr>
                                <td style="text-align: center;">
                                    <h2 style="font-size: 24px; margin: 0;">Notificación de eliminación de cuenta</h2>
                                    <p style="font-size: 16px;">
                                        Estimado ${name}, lamentamos informarte que tu cuenta ha sido eliminada por el administrador. Esta acción fue necesaria para mantener la calidad y seguridad de nuestra plataforma, si consideras que cometimos un error, tienes alguna pregunta o necesitas asistencia, no dudes en ponerte en contacto con nuestro equipo de soporte.
                                    </p>
                                    <p style="font-size: 16px; font-weight: bold;">
                                        - Fecha y hora de eliminación: ${new Date().toLocaleDateString()} - ${new Date().toLocaleTimeString()}
                                    </p>
                                    <p style="font-size: 16px;">
                                        Gracias por tu comprensión.
                                    </p>
                                </td>
                            </tr>
                        </table>`
                        const resultSendMail = await this.mail.sendMail(email, "Notificación de eliminación de cuenta", html);
                        if (resultSendMail.rejected && resultSendMail.rejected.length > 0) {
                            errorCorreo = true;
                            errorCorreo.message = "La cuenta, se ha eliminado pero ocurrio un error al intantar enviar el correo de notificación al usuario."
                        }
                    }
                    if (deleteCart.statusCode === "error" || deleteUserProducts.statusCode === "error" || errorCorreo === true) {
                        response.statusCode = 500;
                        response.message = "Error al eliminar la cuenta: " + deleteCart.message || deleteUserProducts.message || errorCorreo.message
                    } else if (deleteCart.statusCode === 200 && deleteUserProducts.statusCode === 404) {
                        response.statusCode = 200;
                        response.message = "Cuenta eliminada exitosamente. No se encontraron productos asociados a la cuenta.";
                    } else if (deleteCart.statusCode === 200 && deleteUserProducts.statusCode === 200) {
                        response.statusCode = 200;
                        response.message = "Cuenta eliminada exitosamente. " + deleteUserProducts.message;
                    }
                }
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al eliminar cuenta - Service: " + error.message;
        };
        return response;
    };
};