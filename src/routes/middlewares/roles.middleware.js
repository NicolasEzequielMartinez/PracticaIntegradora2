// ADMIN
export const rolesMiddlewareAdmin = (req, res, next) => {
    if(req.user.role === 'admin'){
        next()
    } else {
        res.status(401).send({error: 'No tienes acceso a esta ruta.' })
    }
}

// ADMIN PREMIUM
export const rolesMiddlewareAdminAndPremiun = (req, res, next) => {
    if(req.user.role === 'admin' || req.user.role === 'premium' ){
        next()
    } else {
        res.status(401).send({error: 'No tienes acceso a esta ruta.' })
    }
}

// USER PREMIUM
export const rolesMiddlewareUserPremium = (req, res, next) => {
    if(req.user.role === 'premium'){
        next()
    } else {
        res.status(401).send({error: 'No tienes acceso a esta ruta.' })
    }
}

// USER & USER PREMIUM
export const rolesMiddlewareUser = (req, res, next) => {
    if(req.user.role === 'user' || req.user.role === 'premium'){
        next()
    } else {
        res.status(401).send({error: 'No tienes acceso a esta ruta.' })
    }
}

// ANY AUTHENTICATED USER 
export const rolesMiddlewarePublic = (req, res, next) => {
    if(req.user.role === 'user' || req.user.role === 'premium' || req.user.role === 'admin'){
        next()
    } else {
        res.status(401).send({error: 'No tienes acceso a esta ruta.' })
    }
}