import { Router } from "express";
import CartController from "../controllers/cartController.js";
import { rolesRMiddlewareUsers, rolesRMiddlewareAdmin, rolesRMiddlewarePublic } from './middlewares/rolesRoutes.middleware.js';
import { verificarPertenenciaCarrito } from "./middlewares/carts.middleware.js";
import passport from "passport";

const cartRouter = Router();
let cartController = new CartController();


cartRouter.post("/", async (req, res) => {
  const result = await cartController.createCartController(req, res);
  res.status(result.statusCode).send(result);
})

cartRouter.get("/:cid", passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken'
}), rolesRMiddlewareUsers, async (req, res, next) => {
  const result = await cartController.getCartByIdController(req, res, next);
  if(result !== undefined) {
    res.status(result.statusCode).send(result);
  };
});

cartRouter.get('/', passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken'
}), rolesRMiddlewareAdmin, async (req, res) => {
  const result = await cartController.getAllCartsController(req, res);
  res.status(result.statusCode).send(result);
});

cartRouter.post('/:cid/products/:pid/quantity/:quantity', passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken'
}), rolesRMiddlewareUsers, verificarPertenenciaCarrito, async (req, res, next) => {
  const result = await cartController.addProductInCartController(req, res, next); 
  if(result !== undefined) {
    res.status(result.statusCode).send(result);
  };
});

cartRouter.post('/:cid/orderGeneration', passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken' }), rolesRMiddlewareUsers, verificarPertenenciaCarrito, async (req, res, next) => {
  const result = await cartController.purchaseOrderController(req, res, next);
  if(result !== undefined) {
    res.status(result.statusCode).send(result);
  };
});

cartRouter.post('/:cid/purchaseSuccess', passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken'
}), rolesRMiddlewareUsers, verificarPertenenciaCarrito, async (req, res, next) => {
  const result = await cartController.purchaseSuccessController(req, res, next);
  if(result !== undefined) {
    res.status(result.statusCode).send(result);
  };
});

cartRouter.delete('/:cid/products/:pid', passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken'
}), rolesRMiddlewareUsers, verificarPertenenciaCarrito, async (req, res, next) => {
  const result = await cartController.deleteProductFromCartController(req, res, next);
  if(result !== undefined) {
    res.status(result.statusCode).send(result);
  };
});

cartRouter.delete('/:cid', passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken'
}), rolesRMiddlewareUsers, verificarPertenenciaCarrito, async (req, res, next) => {
  const result = await cartController.deleteAllProductsFromCartController(req, res, next);
  if(result !== undefined) {
    res.status(result.statusCode).send(result);
  };
});

cartRouter.put('/:cid',passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken'
}), rolesRMiddlewareUsers, verificarPertenenciaCarrito, async (req, res, next) => {
  const result = await cartController.updateCartController(req, res, next);
  if(result !== undefined) {
    res.status(result.statusCode).send(result);
  };
});

cartRouter.put('/:cid/products/:pid', passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken'
}), rolesRMiddlewareUsers, verificarPertenenciaCarrito, async (req, res, next) => {
  const result = await cartController.updateProductInCartController(req, res, next);
  if(result !== undefined) {
    res.status(result.statusCode).send(result);
  };
});

cartRouter.delete('/deleteCart/:cid', passport.authenticate('jwt', { session: false, failureRedirect: '/invalidToken'
}), rolesRMiddlewarePublic, async (req, res, next) => {
  const result = await cartController.deleteCartController(req, res, next);
  if(result !== undefined) {
    res.status(result.statusCode).send(result);
  };
});

export default cartRouter;