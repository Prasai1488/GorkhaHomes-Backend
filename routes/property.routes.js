import express from "express";
import { createPost } from "../controllers/UserControllers/user.property.controller.js";
import validateReqBody from "../middleware/validation.middleware.js";
import  postSchema  from "../validation/post.validation.schema.js";
import { verifyToken } from "../middleware/verify.token.js";

const router = express.Router();

router.post("/create-property",verifyToken, validateReqBody(postSchema), createPost);

export default router;
