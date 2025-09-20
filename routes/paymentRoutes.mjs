import express from "express";
import { payment } from "../controllers/paymentController.mjs";
const routes = express.Router();

routes.post("/", payment);

export default routes;
