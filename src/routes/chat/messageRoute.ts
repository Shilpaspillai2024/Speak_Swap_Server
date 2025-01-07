import { Router } from "express";
import MessageController from "../../controllers/chat/messageController";
import MessageRepositoryImplementation from "../../repositories/implementation/chat/messageRepositoryImplementation";
import MessageService from "../../services/chat/messageService";
import authMiddleware from "../../middlewares/authMiddleware";
const router = Router();


const messageRepository = new MessageRepositoryImplementation();
const messageService = new MessageService(messageRepository);
const messageController = new MessageController(messageService);


router.post("/send",authMiddleware, (req, res) => messageController.createMessage(req, res));
router.get("/:chatId", authMiddleware,(req, res) => messageController.getMessagesByChatId(req, res));
router.put("/markAsRead",authMiddleware, (req, res) => messageController.markMessagesAsRead(req, res));





export default router;
