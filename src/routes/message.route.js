import express from "express"
import { verifyToken } from "../middleware/verifyToken"
import { getUsersForSidebar, getMessages, sendMessage } from "../controllers/message.controller"

const router = express.Router()

router.get("/users", verifyToken, getUsersForSidebar)
router.get("/:id", verifyToken, getMessages)

router.post("/send/:id", verifyToken, sendMessage)
