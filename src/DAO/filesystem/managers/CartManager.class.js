import fs from "fs";
import { v4 as uuidV4 } from "uuid";

const path = "src/classes/files/carts.json";

export default class ManagerCarts {
  consultarCarts = async () => {
    console.log("Existe.", fs.existsSync(path));
    if (fs.existsSync(path)) {
      const data = await fs.promises.readFile(path, "utf-8");
      const carts = JSON.parse(data);
      return carts;
    } else {
      return [];
    }
  };

  crearCart = async () => {
    const carts = await this.consultarCarts();
    carts.push({id: uuidV4(), products: [] });
    return await fs.promises.writeFile(path, JSON.stringify(carts, null, "\t"));
  };

  consultarCartPorId = async (id) => {
    const carts = await this.consultarCarts();
    const cart = carts.find((cart) => {
      return cart.id == id;
    });
    return cart ? cart : "Carrito no encontrado.";
  };

  agregarProductoEnCarrito = async (idCart, idProduct) => {
    const cart = await this.consultarCartPorId(idCart);
    const index = cart.products.findIndex((product) => {
      return product.id == idProduct
    });

    if (index == -1){
      cart.products.push({id: idProduct, quantity: 1})
    } else {
      cart.products[index].quantity++;
    }

    const carts = await this.consultarCarts() 
    const cartIndex = carts.findIndex((cartIterator) => {
      return cartIterator.id == cart.id
    })

    carts[cartIndex] = cart

    return await fs.promises.writeFile(path, JSON.stringify(carts, null, "\t")) 
  }
}