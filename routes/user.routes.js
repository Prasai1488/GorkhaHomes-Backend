import express from "express";
import { getUser,updateUser } from "../controllers/UserControllers/user.profile.controller.js";
import { verifyToken } from "../middleware/verify.token.js";
import { checkUserOwnership } from "../middleware/check.user.ownership.js";
import validateIdFromReqParams from "../middleware/validate.id.js";

const router = express.Router();

router.get("/get-user/:id", validateIdFromReqParams,verifyToken, checkUserOwnership, getUser);
router.put("/update-user/:id", validateIdFromReqParams,verifyToken, checkUserOwnership, updateUser);


export default router;
