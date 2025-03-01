import express from "express";
import { approvePost } from "../controllers/AdminControllers/approve.post.js";
import { verifyToken } from "../middleware/verify.token.js";
import validateIdFromReqParams from "../middleware/validate.id.js";

const router = express.Router();

router.patch("/approve-post/:id", validateIdFromReqParams,verifyToken, approvePost);

export default router;
