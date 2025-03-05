import { Request, Response } from "express";
import IChatService from "../../services/interfaces/chat/ichatService";
import IMessageService from "../../services/interfaces/chat/imessageService";
import { HttpStatus } from "../../constants/httpStatus";
import uploadToCloudinary from "../../utils/cloudinaryUploadUtils";

class MessageController {
  private messageService: IMessageService;

  private chatService: IChatService;

  constructor(messageService: IMessageService, chatService: IChatService) {
    this.messageService = messageService;

    this.chatService = chatService;
  }

  async createMessage(req: Request, res: Response): Promise<void> {
    const { chatId, senderId, senderRole, message, imageUrl } = req.body;

    try {
      const newMessage = await this.messageService.createMessage(
        chatId,
        senderId,
        senderRole,
        message,
        imageUrl
      );
      res.status(HttpStatus.CREATED).json(newMessage);
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }


  async uploadMessageImage(req: Request, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "No image uploaded" });
        return;
      }

      
      const result = await uploadToCloudinary(req.file.path, "chat_images");

      res.status(HttpStatus.OK).json({
        imageUrl: result.secure_url,
      });
    } catch (error: any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        error: error.message,
      });
    }
  }

  async getMessagesByChatId(req: Request, res: Response): Promise<void> {
    const { chatId } = req.params;

    try {
      const messages = await this.messageService.getMessagesByChatId(chatId);
      res.status(HttpStatus.OK).json(messages);
    } catch (error: any) {
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
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
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ error: error.message });
    }
  }

 
}

export default MessageController;
