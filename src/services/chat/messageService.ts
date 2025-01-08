import { MessageRepository } from "../../repositories/chat/messageRepository";
import { IMessage } from "../../models/chat/messageModel";

class MessageService{
    private messageRepository:MessageRepository;

    constructor(messageRepository:MessageRepository){
        this.messageRepository=messageRepository;
    }

    // async createMessage(chatId: string, senderId: string, senderRole: "user" | "tutor",reciepientId:string,reciepientRole:"user" | "tutor", message: string): Promise<IMessage> {
    //  return await this.messageRepository.createMessage(chatId,senderId,senderRole,reciepientId,reciepientRole,message)
    
    // }


    async createMessage(chatId: string, senderId: string, senderRole: "user" | "tutor", message: string): Promise<IMessage> {
        return await this.messageRepository.createMessage(chatId,senderId,senderRole,message)
       
       }




     async getMessagesByChatId(chatId:string):Promise<IMessage[]>{
        return await this.messageRepository.getMessagesByChatId(chatId)
     }

   async markMessagesAsRead(chatId: string, participantId: string): Promise<void>{

    return await this.messageRepository.markMessagesAsRead(chatId,participantId)
   }


    
}

export default MessageService