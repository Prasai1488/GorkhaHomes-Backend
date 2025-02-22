import express from "express";
import { getUser } from "../controllers/UserControllers/user.profile.controller.js";
import { verifyToken } from "../middleware/verify.token.js";
import { checkUserOwnership } from "../middleware/check.user.ownership.js";

const router = express.Router();

router.get("/get-user/:id", verifyToken, checkUserOwnership, getUser);

export default router;
