import { Router } from "express";
import MessageController from "../../controllers/chat/messageController";
import MessageRepository from "../../repositories/implementation/chat/messageRepository";
import MessageService from "../../services/implementation/chat/messageService";
import authMiddleware from "../../middlewares/authMiddleware";
import ChatService from "../../services/implementation/chat/chatService";
import ChatRepository from "../../repositories/implementation/chat/chatRepository";
const router = Router();


const messageRepository = new MessageRepository();

const chatRepository=new ChatRepository();
const chatService=new ChatService(chatRepository)
const messageService = new MessageService(messageRepository);
const messageController = new MessageController(messageService,chatService);


router.post("/send",authMiddleware, (req, res) => messageController.createMessage(req, res));
router.get("/:chatId", authMiddleware,(req, res) => messageController.getMessagesByChatId(req, res));
router.put("/markAsRead",authMiddleware, (req, res) => messageController.markMessagesAsRead(req, res));

router.get('/unread/:participantId',authMiddleware,(req,res)=>messageController.getUnreadCount(req,res))



export default router;
