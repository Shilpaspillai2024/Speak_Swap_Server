import { Router } from "express";
import ChatController from "../../controllers/chat/chatController";
import ChatRepositoryImplementation from "../../repositories/implementation/chat/chatRepositoryImplementation";
import ChatService from "../../services/chat/chatService";
import authMiddleware from "../../middlewares/authMiddleware";

const router=Router()

const chatRepository =new ChatRepositoryImplementation();
const chatService=new ChatService(chatRepository)
const chatController=new ChatController(chatService)

router.post("/",authMiddleware, (req, res) => chatController.createChat(req, res));
router.get("/:chatId",authMiddleware, (req, res) => chatController.getChatById(req, res));
router.get("/participant/:participantId",authMiddleware, (req, res) => chatController.getChatsByParticipant(req, res));
router.put("/updateLastMessage",authMiddleware, (req, res) => chatController.updateLastMessage(req, res));




export default router;