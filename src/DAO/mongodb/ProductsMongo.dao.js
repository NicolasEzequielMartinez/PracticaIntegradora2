import mongoose from "mongoose";
import { productsModel } from "./models/products.model.js";
import config from "../../config.js";

export default class ProductDAO {
    
    // MONGOOSE
    connection = mongoose.connect( config.MONGO_URL );
    
    async createProduct(info) {
        let response = {};
        try {
            const result = await productsModel.create(info);
            response.status = "success";
            response.result = result;
        } catch (error) {
            response.status = "error";
            response.message = "Error al crear el producto - DAO: " + error.message;
        };
        return response;
    };

    async getProductById(pid) {
        let response = {};
        try {
            const result = await productsModel.findOne({ _id: pid });
            if (result === null) {
                response.status = "not found product";
            } else {
                response.status = "success";
                response.result = result;
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al obtener el producto por ID - DAO: " + error.message;
        };
        return response;
    };

    async getAllProducts(limit = 10, page = 1, sort = 1, filtro = null, filtroVal = null) {
        let response = {};
        try {
            let whereOptions = {};
            if (filtro != '' && filtroVal != '') {
                whereOptions = {
                    [filtro]: filtroVal
                };
            };
            let result = {};
            if (sort !== 1) {
                result = await productsModel.paginate(whereOptions, {
                    limit: limit,
                    page: page,
                    sort: {
                        price: sort
                    },
                });
            } else {
                result = await productsModel.paginate(whereOptions, {
                    limit: limit,
                    page: page,
                });
            }
            if (result.docs.length === 0) {
                response.status = "not found products";
            } else {
                response.status = "success";
                response.result = {
                    products: result
                };
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al obtener los productos - DAO: " + error.message;
        };
        return response;
    };

    async deleteProduct(pid) {
        let response = {};
        try {
            const result = await productsModel.findOne({ _id: pid });
            if (result === null) {
                response.status = "not found product";
            } else {
                const result2 = await productsModel.deleteOne({ _id: pid });
                if (result2.deletedCount === 0) {
                    response.status = "not found product";
                } else if (result2.deletedCount === 1) {
                    response.status = "success";
                    response.result = result;
                };
            }
        } catch (error) {
            response.status = "error";
            response.message = "Error al eliminar el producto - DAO: " + error.message;
        };
        return response;
    };

    async deleteAllPremiumProduct(uid) {
        let response = {};
        try {
            const productsToDelete = await productsModel.find({
                owner: uid
            });
            if (productsToDelete.length === 0) {
                response.status = "not found products";
            } else {
                const result = await productsModel.deleteMany({
                    owner: uid
                });
                if (result.deletedCount > 0) {
                    if (role === "admin") {
                        const userEmail = productsToDelete[0].email;
                        const deletedProducts = [];
                        for (const product of productsToDelete) {
                            const title = product.title;
                            deletedProducts.push(title);
                        }
                        response.status = "success";
                        response.userEmail = userEmail;
                        response.deletedProducts = deletedProducts;
                        response.message = `Se han eliminaron ${result.deletedCount} productos asociados a la cuenta.`;
                    } else {
                        response.status = "success";
                        response.message = `Se han eliminaron ${result.deletedCount} productos asociados a la cuenta.`;
                    }
                } else {
                    response.status = "error";
                    response.message = "No se pudieron eliminar los productos (deleteMany).";
                }
            }
        } catch (error) {
            response.status = "error";
            response.message = "Error al eliminar todos los productos de usuario premium - DAO: " + error.message;
        }
        return response;
    };
    
    async updateProduct(pid, updateProduct) {
        let response = {};
        try {
            const result = await productsModel.updateOne({ _id: pid }, { $set: updateProduct });
            if (result.matchedCount === 0) {
                response.status = "not found product";
            } else if (result.matchedCount === 1) {
                if (result.modifiedCount === 0) {
                    response.status = "update is equal to current";
                } else if (result.modifiedCount === 1) {
                    response.status = "success";
                    response.result = result;
                }
            };
        } catch (error) {
            response.status = "error";
            response.message = "Error al actualizar el producto - DAO: " + error.message;
        };
        return response;
    };
}