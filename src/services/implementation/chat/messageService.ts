
import { IMessageRepository } from "../../../repositories/interfaces/chat/imessageRepository";
import { IMessage } from "../../../models/chat/messageModel";
import IMessageService from "../../interfaces/chat/imessageService";

class MessageService implements IMessageService{
    private messageRepository:IMessageRepository;

    constructor(messageRepository:IMessageRepository){
        this.messageRepository=messageRepository;
    }

    async createMessage(chatId: string, senderId: string, senderRole: "user" | "tutor", message: string): Promise<IMessage> {
        return await this.messageRepository.createMessage(chatId,senderId,senderRole,message)
       
       }




     async getMessagesByChatId(chatId:string):Promise<IMessage[]>{
        return await this.messageRepository.getMessagesByChatId(chatId)
     }

   async markMessagesAsRead(chatId: string, participantId: string): Promise<void>{

    return await this.messageRepository.markMessagesAsRead(chatId,participantId)
   }



   async getUnreadCount(participantId: string): Promise<number> {
     return await this.messageRepository.getUnreadCount(participantId);
   }
    
}

export default MessageService