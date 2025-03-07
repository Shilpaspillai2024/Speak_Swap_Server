
import { IMessage } from "../../../models/chat/messageModel";

export interface IMessageRepository{
   // createMessage(chatId:string,senderId:string,senderRole:"user" | "tutor",reciepientId:string,reciepientRole:"user" | "tutor",message:string):Promise<IMessage>;
    
    createMessage(chatId:string,senderId:string,senderRole:"user" | "tutor",message:string, imageUrl?:string):Promise<IMessage>;
    
    getMessagesByChatId(chatId:string):Promise<IMessage[]>
    markMessagesAsRead(chatId: string, participantId: string): Promise<void>;
    
}