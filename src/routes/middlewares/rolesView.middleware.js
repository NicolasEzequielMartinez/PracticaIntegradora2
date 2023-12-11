export const rolesVMiddlewareAdmin = (req, res, next) => {
    if (req.user.role === 'admin') {
        next();
    } else {
        res.status(401).render('accesoSoloAdmin', {
            title: 'Acceso denegado - Solo administradores'
        });
    };
};

export const rolesVMiddlewareUsers = (req, res, next) => {
    if (req.user.role === 'user' || req.user.role === 'premium') {
        next();
    } else {
        res.status(401).render('accesoUsers', {
            title: 'Acceso denegado - Solo usuarios'
        });
    };
};

export const rolesVMiddlewareAdminAndPremium = (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'premium') {
        next();
    } else {
        res.status(401).render('accesoAdminPrem', {
            title: 'Acceso denegado - Solo administradores y usuarios premium'
        });
    };
};