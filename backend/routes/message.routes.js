import express from "express";
import {
	getMessages,
	sendMessage,
	updateMessage,
	deleteMessage
} from "../controllers/message.controller.js";

import protectRoute from "../middleware/protectRoute.js";

const router = express.Router();

router.get("/:id", protectRoute, getMessages);
router.post("/send/:id", protectRoute, sendMessage);
router.patch("/:id", protectRoute, updateMessage);
router.delete("/:id", protectRoute, deleteMessage);

export default router;
