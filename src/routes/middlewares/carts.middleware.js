import mongoose from "mongoose";
import ErrorEnums from "../../errors/error.enums.js";
import CustomError from "../../errors/customError.class.js";
import ErrorGenerator from "../../errors/error.info.js";

export const verificarPertenenciaCarrito = (req, res, next) =>{
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
    if(req.user.cart === req.params.cid){
        next()
    } else {
        res.status(401).send({
            statusCode: 401,
            h1: "Petición denegada",
            message: "Solo puedes agregar, eliminar o actualizar productos en tu propio carrito. Lo mismo aplica al procesamiento de compras y la actualización del carrito.",
            img: 'https://i.ibb.co/7y1KTNc/acceso.png'
        });    
    };
};