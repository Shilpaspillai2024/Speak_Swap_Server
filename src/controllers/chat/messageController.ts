import { Request,Response } from "express";
import MessageService from "../../services/chat/messageService";

class MessageController{
    private messageService:MessageService;


    constructor(messageService:MessageService){
        this.messageService=messageService;
    }

    async createMessage(req: Request, res: Response): Promise<void> {
        const { chatId, senderId, senderRole,recipientId,recipientRole, message } = req.body;
    
        try {
          const newMessage = await this.messageService.createMessage(chatId, senderId, senderRole,recipientId,recipientRole,message);
          res.status(201).json(newMessage);
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      }
    
      async getMessagesByChatId(req: Request, res: Response): Promise<void> {
        const { chatId } = req.params;
    
        try {
          const messages = await this.messageService.getMessagesByChatId(chatId);
          res.status(200).json(messages);
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      }
    
      async markMessagesAsRead(req: Request, res: Response): Promise<void> {
        const { chatId, participantId } = req.body;
    
        try {
          await this.messageService.markMessagesAsRead(chatId, participantId);
          res.status(200).json({ success: true });
        } catch (error: any) {
          res.status(500).json({ error: error.message });
        }
      }
}

export default MessageController