import fs from "fs";
import {  v4 as uuidV4 } from 'uuid'

const path = "src/classes/files/products.json";

export default class ManagerProducts {

  consultarProductos = async () => {
    console.log("Existe.", fs.existsSync(path));
    if (fs.existsSync(path)) {
      const data = await fs.promises.readFile(path, "utf-8");
      const products = JSON.parse(data);
      return products;
    } else {
      return [];
    }
  };

  crearProducto = async (info) => {
    const productos = await this.consultarProductos();
    info.id = uuidV4();
    productos.push(info);
    await fs.promises.writeFile(path, JSON.stringify(productos, null, "\t"));
    return info;
  };

  consultarProductoPorId = async (id) => {
    const productos = await this.consultarProductos();
    const producto = productos.find((producto) => producto.id == id);

    if (!producto) {
      return null;
    }

    return producto;
  };

  actualizarProducto = async (pid, updatedProduct) => {
    const products = await this.consultarProductos();
    const existingProduct = products.find((product) => product.id === pid);

    if (!existingProduct) {
      return null;
    }

    const updatedProductData = {
      ...existingProduct,
      ...updatedProduct
    };

    const updatedProducts = products.map((product) => {
      if (product.id === pid) {
        return updatedProductData;
      }
      return product;
    });

    await fs.promises.writeFile(path, JSON.stringify(updatedProducts, null, "\t"));
    return updatedProductData;
  };

  eliminarProducto = async (pid) => {
    const products = await this.consultarProductos();
    const existingProduct = products.find((product) => product.id === pid);

    if (!existingProduct) {
      return null;
    }

    const updatedProducts = products.filter((product) => product.id !== pid);
    await fs.promises.writeFile(path, JSON.stringify(updatedProducts, null, "\t"));
    return "Producto eliminado exitosamente.";
  };
}