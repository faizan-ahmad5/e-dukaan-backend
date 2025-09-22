import express from "express";
import {
  addToCart,
  getCart,
  updateCart,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.mjs";
import { protect } from "../middleware/authMiddleware.mjs";

const routes = express.Router();

routes.post("/add", protect, addToCart);
routes.post("/", protect, addToCart); // RESTful endpoint
routes.get("/", protect, getCart);
routes.put("/", protect, updateCart);
routes.delete("/remove/:productId", protect, removeFromCart);
routes.delete("/clear", protect, clearCart);

export default routes;
