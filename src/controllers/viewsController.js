import ProductService from '../services/products.service.js';
import MessageService from "../services/message.service.js";

export default class ViewsController {
    constructor() {
        this.productService = new ProductService();
        this.messageService = new MessageService();
    }
    // PRODUCTS VIEW:

    async getAllProductsControllerV(limit, page, sort, filtro, filtroVal) {
        let limitV = limit || 10;
        let pageV = page || 1;
        let sortV = sort || 1;
        let filtroV = filtro || null;
        let filtroValV = filtroVal || null;
        let response = {};
        if (limitV === "0" || pageV === "0" || filtroValV === "0") {
            response.statusCode = 400;
            if (limitV === "0") {
                response.message = 'El valor ingresado para el filtro "Mostrar" (Cantidad de productos a mostrar por página), no es válido. Por favor, ingresa un número positivo mayor a 0.'
            } else if (pageV === "0") {
                response.message = 'El valor ingresado para el filtro "Página" (Página del catálogo), no es válido. Por favor, ingresa un número positivo mayor a 0.'
            } else if(filtroV === "price" && filtroValV === "0"){
                response.message = 'El valor ingresado para el filtro "Precio" (Busqueda de productos por su precio), no es válido. Por favor, ingresa un número positivo mayor a 0.'
            } else if(filtroV === "stock" && filtroValV === "0"){
                response.message = 'El valor ingresado para el filtro "Stock" (Busqueda de productos por según su stock), no es válido. Por favor, ingresa un número positivo mayor a 0.'
            };

        } else {
            try {
                const resultService = await this.productService.getAllProductsService(limitV, pageV, sortV, filtroV, filtroValV);
                response.statusCode = resultService.statusCode;
                response.message = resultService.message;
                if (resultService.statusCode === 200) {
                    response.result = resultService.result;
                };
            } catch (error) {
                response.statusCode = 500;
                response.message = "Error al obtener los productos - Controller View: " + error.message;
            };
        }
        return response;
    }

    // CHAT VIEW: 

    async getAllMessageControllerV() {
        let response = {};
        try {
            const resultService = await this.messageService.getAllMessageService();
            response.statusCode = resultService.statusCode;
            response.message = resultService.message;
            if (resultService.statusCode === 200) {
                response.result = resultService.result;
            };
        } catch (error) {
            response.statusCode = 500;
            response.message = "Error al obtener los mensajes - Controller: " + error.message;
        };
        return response;
    };
};