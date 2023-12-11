import mongoose from "mongoose";
import { messageModel } from "./models/messages.model.js"
import config from "../../config.js";

export default class MessageDAO {

    // MONGOOSE
    connection = mongoose.connect( config.MONGO_URL );

    async createMessage(message) {
        let response = {};
        try {
            const result = await messageModel.create(message);
            response.status = "success";
        } catch (error) {
            response.status = "error";
            response.message = "Error al crear el mensaje - DAO: " + error.message;
        };
        return response;
    };

    async getAllMessage() {
        let response = {};
        try {
            let result = await messageModel.find().lean();
            if (result.length === 0) {
                response.status = "not found messages";
                response.result = result;
            } else {
                response.status = "success";
                response.result = result;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al obtener los mensajes - DAO: " + error.message;
        };
        return response;
    };

    async deleteMessage(mid, uid) {
        let response = {};
        try {
            let getSms = await messageModel.findOne({
                _id: mid
            });
            let UID = getSms.userId;
            if (uid === UID) {
                let result = await messageModel.deleteOne({
                    _id: mid
                });
                if (result.deletedCount === 0) {
                    response.status = "not found message";
                } else if (result.deletedCount === 1) {
                    response.status = "success";
                };
            } else {
                response.status = "unauthorized";
            }
        } catch (error) {
            response.status = "error";
            response.message = "Error al eliminar el mensaje - DAO: " + error.message;
        };
        return response;
    };
}