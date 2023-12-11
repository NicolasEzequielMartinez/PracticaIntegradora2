import ErrorEnums from "./error.enums.js";

export const errorMiddleware = (error, req, res, next) => {
    req.logger.warn(error.cause);
    switch (error.code) {

        // Carts:
            case ErrorEnums.INVALID_ID_CART_ERROR:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.INVALID_ID_CART_ERROR
            });
            break;

            case ErrorEnums.QUANTITY_INVALID_ERROR:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.QUANTITY_INVALID_ERROR
            });
            break;

            case ErrorEnums.PRODUCTS_MISSING_OR_INVALID:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.PRODUCTS_MISSING_OR_INVALID
            });
            break;

            case ErrorEnums.INVALID_PRODUCT:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.INVALID_PRODUCT
            });
            break;

            case ErrorEnums.INVALID_EMAIL:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.INVALID_EMAIL
            });
            break;

            case ErrorEnums.FORBIDDEN_UPDATED_CART_FIELDS:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.FORBIDDEN_UPDATED_CART_FIELDS
            });
            break;

            case ErrorEnums.INVALID_UPDATED_CART_FIELDS:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.INVALID_UPDATED_CART_FIELDS
            });
            break;

            case ErrorEnums.INVALID_UPTATED_PROD_IN_CART:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.INVALID_UPTATED_PROD_IN_CART
            });
            break;

        // Products: 
            case ErrorEnums.INVALID_PRODUCT_DATA:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.INVALID_PRODUCT_DATA
            });
            break;

            case ErrorEnums.INVALID_ID_PRODUCT_ERROR:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.INVALID_ID_PRODUCT_ERROR
            });
            break;

            case ErrorEnums.INVALID_UPDATED_PRODUCT_FIELDS:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.INVALID_UPDATED_PRODUCT_FIELDS
            });
            break;

        // Menssages: 
            case ErrorEnums.INVALID_MESSAGE_DATA:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.INVALID_MESSAGE_DATA
            });
            break;

            case ErrorEnums.INVALID_ID_MESSAGE_ERROR:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.INVALID_ID_MESSAGE_ERROR
            });
            break;

        // Ticket:
            case ErrorEnums.INVALID_TICKET_DATA:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.INVALID_TICKET_DATA
            });
            break;

            case ErrorEnums.INVALID_ID_TICKET_ERROR:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.INVALID_ID_TICKET_ERROR
            });
            break;

        // Session: 
            case ErrorEnums.INVALID_REGISTER_DATA:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.INVALID_REGISTER_DATA
            });
            break;

            case ErrorEnums.INVALID_LOGIN_DATA:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.INVALID_LOGIN_DATA
            });
            break;

            case ErrorEnums.INVALID_EMAIL_USER:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.INVALID_EMAIL_USER
            });
            break;
    
            case ErrorEnums.INVALID_NEW_PASS_USER:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.INVALID_NEW_PASS_USER
            });
            break;
    
            case ErrorEnums.INVALID_ID_USER_ERROR:
            res.status(400).send({
                status: "error",
                error: error.name,
                cause: error.cause,
                message: error.message,
                code: ErrorEnums.INVALID_ID_USER_ERROR
            });
            break;

        // User:
            case ErrorEnums.INVALID_FORM_FILES_ERROR:
                res.status(400).send({
                    status: "error",
                    error: error.name,
                    cause: error.cause,
                    message: error.message,
                    code: ErrorEnums.INVALID_FORM_FILES_ERROR
                });
                break;

        // Stripe:
            case ErrorEnums.INVALID_AMOUNT_ORDER:
                res.status(400).send({
                    status: "error",
                    error: error.name,
                    cause: error.cause,
                    message: error.message,
                    code: ErrorEnums.INVALID_AMOUNT_ORDER
                });
                break;

            case ErrorEnums.INVALID_PRODUCT_ORDER_DATA:
                res.status(400).send({
                    status: "error",
                    error: error.name,
                    cause: error.cause,
                    message: error.message,
                    code: ErrorEnums.INVALID_PRODUCT_ORDER_DATA
                });
                break;

        // Filter products:
            case ErrorEnums.INVALID_FILTER_PRODUCT_ERROR:
                res.status(400).send({
                    status: "error",
                    error: error.name,
                    cause: error.cause,
                    message: error.message,
                    code: ErrorEnums.INVALID_FILTER_PRODUCT_ERROR
                });
                break;

            default:
                res.status(500).send({
                    status: "error",
                    error: "Unhandled error",
                    cause: error.message
                });
    }
};