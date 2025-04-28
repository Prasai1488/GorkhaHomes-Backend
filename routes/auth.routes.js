import express from "express";
import { login, register, logout } from "../controllers/auth.controller.js";
import validateReqBody from "../middleware/validation.middleware.js";
import {
  registerValidationSchema,
  loginValidationSchema,
} from "../validation/auth.validation.schema.js";

const router = express.Router();

router.post("/register",  register);
router.post("/login", validateReqBody(loginValidationSchema), login);
router.post("/logout", logout);

export default router;
