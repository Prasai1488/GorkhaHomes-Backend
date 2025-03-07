import express from "express";
import { createPost,updatePost,getPendingPosts,getRejectedPosts } from "../controllers/UserControllers/user.property.controller.js";
import validateReqBody from "../middleware/validation.middleware.js";
import  postSchema  from "../validation/post.validation.schema.js";
import { verifyToken } from "../middleware/verify.token.js";
import validateIdFromReqParams from "../middleware/validate.id.js";
import { checkUserPostOwnership } from "../middleware/check.user.ownership.js";
import { savePost,unsavePost } from "../controllers/PostController/post.controller.js";

const router = express.Router();

router.post("/create-property",verifyToken, validateReqBody(postSchema), createPost);
router.put("/update-property/:id",validateIdFromReqParams,verifyToken,checkUserPostOwnership ,updatePost);
router.get("/get-pending-posts",verifyToken,getPendingPosts);
router.get("/get-rejected-posts",verifyToken,getRejectedPosts);
router.post("/save-post",verifyToken,savePost);
router.delete("/unsave-post",verifyToken,unsavePost);


export default router;

