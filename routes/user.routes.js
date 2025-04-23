import express from "express";
import { getUser,updateUser,getNotificationNumber,profilePosts, } from "../controllers/UserControllers/user.profile.controller.js";
import { verifyToken } from "../middleware/verify.token.js";
import { checkUserOwnership } from "../middleware/check.user.ownership.js";
import validateIdFromReqParams from "../middleware/validate.id.js";
import { getCurrentUser } from "../controllers/UserControllers/user.controller.js";
import { savePost } from "../controllers/UserControllers/user.property.controller.js";

const router = express.Router();

router.get("/get-user/:id", validateIdFromReqParams,verifyToken, checkUserOwnership, getUser);
router.put("/update-user/:id", validateIdFromReqParams,verifyToken, checkUserOwnership, updateUser);
router.get("/notification", verifyToken, getNotificationNumber);
router.get("/profilePosts", verifyToken, profilePosts);
router.get("/user", getCurrentUser);
router.post("/save", verifyToken, savePost);

export default router;

