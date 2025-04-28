import express from "express";
import { getRecommendations } from "../controllers/SmartRecommendation/recommendation.controller.js";
import { verifyToken } from "../middleware/verify.token.js";

const router = express.Router();

router.get("/get-recommendations", verifyToken, getRecommendations);

export default router;

