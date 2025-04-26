import express from "express";
import {
  createPost,
  updatePost,
  getPendingPosts,
  getRejectedPosts,
  deletePost,
} from "../controllers/UserControllers/user.property.controller.js";

import { verifyToken } from "../middleware/verify.token.js";
import validateIdFromReqParams from "../middleware/validate.id.js";
import { checkUserPostOwnership } from "../middleware/check.user.ownership.js";
import {
  savePosts,
  unsavePost,
  getApprovedPostById,
  getPosts,
} from "../controllers/PostController/post.controller.js";

const router = express.Router();

router.post("/create-property", verifyToken, createPost);
router.put(
  "/update-property/:id",
  validateIdFromReqParams,
  verifyToken,
  checkUserPostOwnership,
  updatePost
);
router.get("/get-pending-posts", verifyToken, getPendingPosts);
router.get("/get-rejected-posts", verifyToken, getRejectedPosts);
router.post("/save-post", verifyToken, savePosts);
router.delete("/unsave-post", verifyToken, unsavePost);
router.get("/:id", validateIdFromReqParams, getApprovedPostById);
router.get("/", getPosts);
router.delete(
  "/delete/:id",
  validateIdFromReqParams,
  verifyToken,
  checkUserPostOwnership,
  deletePost
);

export default router;
