import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { signup, login, profile } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", verifyToken, profile);

export default router;
