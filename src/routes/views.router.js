import { Router } from 'express';
import passport from 'passport';
import { rolesVMiddlewareAdmin, rolesVMiddlewareUsers, rolesVMiddlewareAdminAndPremium } from './middlewares/rolesView.middleware.js'

const viewsRouter = Router();

viewsRouter.get('/invalidToken', (req, res) => {
  res.render('invalidToken', {
    title: 'Acceso denegado - Token vencido'
  })
})

viewsRouter.get('/products', passport.authenticate('jwt', {
  session: false,
  failureRedirect: '/invalidToken'
}), rolesVMiddlewareUsers, (req, res) => {
  res.render('products', {
    title: 'Productos'
  })
});

viewsRouter.get('/cart', passport.authenticate('jwt', {
  session: false,
  failureRedirect: '/invalidToken'
}), rolesVMiddlewareUsers, (req, res) => {
  res.render('cart', {
    title: 'Carrito de Compras'
  });
});

viewsRouter.get('/paySuccess', passport.authenticate('jwt', {
  session: false,
  failureRedirect: '/notLoggedIn'
}), rolesVMiddlewareUsers, (req, res) => {
  res.render('pay', {
    title: 'Pago exitoso'
  });
});

viewsRouter.get('/tickets', passport.authenticate('jwt', {
  session: false,
  failureRedirect: '/notLoggedIn'
}), rolesVMiddlewareUsers, (req, res) => {
  res.render('tickets', {
    title: 'Tickets'
  });
});

viewsRouter.get('/chat', passport.authenticate('jwt', {
  session: false,
  failureRedirect: '/invalidToken'
}), rolesVMiddlewareUsers, (req, res) => {
  res.render('chat', {
    title: 'Chat'
  })
});

viewsRouter.get('/perfil', passport.authenticate('jwt', {
  session: false,
  failureRedirect: '/invalidToken'
}),rolesVMiddlewareUsers, (req, res) => {
  res.render('profile', {
    title: 'Perfil'
  })
});

viewsRouter.get('/register', (req, res) => {
  res.render('register', {
    title: 'Registro'
  });
});

viewsRouter.get('/login', (req, res) => {
  res.render('login', {
    title: 'Iniciar Sesión'
  });
});

viewsRouter.get('/changeRole', passport.authenticate('jwt', {
  session: false,
  failureRedirect: '/notLoggedIn'
}), rolesVMiddlewareUsers, (req, res) => {
  res.render('changeRole', {
    title: 'Cambiar Role'
  });
});

viewsRouter.get('/completeProfile', (req, res) => {
  res.render('extraForm', {
    title: 'Formulario'
  })
});

viewsRouter.get('/requestResetPassword', (req, res) => {
  res.render('requestResetPassword', {
    title: 'Restablecer Contraseña - Solicitar Correo'
  })
})

viewsRouter.get('/resetPasswordView', passport.authenticate('jwtResetPass', {
  session: false,
  failureRedirect: '/requestResetPassword'
}), (req, res) => {
  res.render('resetPassword', {
    title: 'Restablecer Contraseña'
  })
})

viewsRouter.get('/adminPanel', passport.authenticate('jwt', {
  session: false,
  failureRedirect: '/notLoggedIn'
}), rolesVMiddlewareAdmin, (req, res) => {
  res.render('userAdmin', {
    title: 'Panel de administrador'
  });
});

viewsRouter.get('/storeProducts', passport.authenticate('jwt', {
  session: false,
  failureRedirect: '/notLoggedIn'
}), rolesVMiddlewareAdminAndPremium, (req, res) => {
  res.render('store', {
    title: 'Publicar productos'
  });
});

export default viewsRouter;