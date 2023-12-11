import { Router } from "express";
import { generateProduct } from "../mocks/mock.config.js";

const mockRouter = Router();

mockRouter.get("/", async (req, res) => {
    let mockedProducts = [];
    for (let i = 0; i < 100; i++) {
        mockedProducts.push(generateProduct());
    };
    res.send({
        status: 'success',
        message: 'Productos generados',
        payload: mockedProducts
    })
});

export default mockRouter;