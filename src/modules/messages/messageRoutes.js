import {Router} from "express";
import authMiddleware from "../../app/middleware/auth.middleware.js";
import { sendMessage, getMyMessages } from "./message.controller.js";
const router = Router();

router.post('/send-message', authMiddleware, sendMessage);
router.get("/get-messages", authMiddleware, getMyMessages);

export const messageRouter = router;

