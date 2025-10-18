import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { signup, login, getProfile } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/profile", verifyToken, getProfile);

export default router;
