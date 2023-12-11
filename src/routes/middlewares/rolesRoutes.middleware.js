export const rolesRMiddlewareAdmin = (req, res, next) => {
    if (req.user.role === 'admin') {
        next()
    } else {
        res.status(401).send({
            statusCode: 401,
            h1: "Acceso denegado - Solo administradores",
            message: "La funcionalidad a la que intentas acceder es exclusiva para administradores y no está permitido su uso para usuarios regulares o premium. Por favor, inicia sesión con una cuenta de administrador.",
            img: 'https://i.ibb.co/7y1KTNc/acceso.png'
        });
    };
};

export const rolesRMiddlewareUsers = (req, res, next) => {
    if (req.user.role === 'user' || req.user.role === 'premium') {
        next()
    } else {
        res.status(401).send({
            statusCode: 401,
            h1: "Acceso denegado - Solo usuarios",
            message: "La funcionalidad a la que intentas acceder es exclusiva para usuarios. Por favor, inicia sesión.",
            img: 'https://i.ibb.co/7y1KTNc/acceso.png'
        });
    };
};

export const rolesRMiddlewareAdminAndPremium = (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'premium') {
        next()
    } else {
        res.status(401).send({
            statusCode: 401,
            h1: 'Acceso denegado - Solo administradores y usuarios premium',
            message: "La funcionalidad a la que intentas acceder solo está disponible para usuarios premium y administradores. Por favor, inicia sesión con la cuenta correspondiente.",
            img: 'https://i.ibb.co/7y1KTNc/acceso.png'
        });
    };
};

export const rolesRMiddlewarePublic = (req, res, next) => {
    if (req.user.role === 'user' || req.user.role === 'premium' || req.user.role === 'admin') {
        next();
    } else {
        res.status(401).send({
            statusCode: 401,
            h1: 'Acceso denegado',
            message: " La funcionalidad a la que intentas acceder requiere autenticación. Por favor, crea una cuenta e inicia sesión.",
            img: 'https://i.ibb.co/7y1KTNc/acceso.png'
        });
    };
};
