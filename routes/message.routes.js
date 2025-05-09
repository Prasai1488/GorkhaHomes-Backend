import express from "express";
import { addMessage } from "../controllers/chatMessage/message.controller.js";
import { verifyToken } from "../middleware/verify.token.js";

const router = express.Router();

router.post("/:chatId", verifyToken, addMessage);

export default router;
