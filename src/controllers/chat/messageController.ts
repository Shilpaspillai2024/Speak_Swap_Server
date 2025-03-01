import { Request,Response } from "express";
import IChatService from "../../services/interfaces/chat/ichatService";
import IMessageService from "../../services/interfaces/chat/imessageService";
import { HttpStatus } from "../../constants/httpStatus";

class MessageController{
    private messageService:IMessageService;


    private chatService:IChatService;

    constructor(messageService:IMessageService,chatService:IChatService){
        this.messageService=messageService;

        this.chatService=chatService;
    }


      async createMessage(req: Request, res: Response): Promise<void> {
        const { chatId, senderId, senderRole, message } = req.body;
    
        try {
          const newMessage = await this.messageService.createMessage(chatId, senderId, senderRole,message);
          res.status(HttpStatus.CREATED).json(newMessage);
        } catch (error: any) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
      }
    
      async getMessagesByChatId(req: Request, res: Response): Promise<void> {
        const { chatId } = req.params;
    
        try {
          const messages = await this.messageService.getMessagesByChatId(chatId);
          res.status(HttpStatus.OK).json(messages);
        } catch (error: any) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
      }
    
      async markMessagesAsRead(req: Request, res: Response): Promise<void> {
        const { chatId, participantId } = req.body;
    
        try {
          await this.messageService.markMessagesAsRead(chatId, participantId);
          const timestamp = new Date().toISOString();
        // await this.chatService.updateLastMessage(chatId,"",new Date(timestamp),0)
          res.status(HttpStatus.OK).json({ success: true });
        } catch (error: any) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
      }


    
}

export default MessageController