import { ChatRepository } from "../../repositories/chat/chatRepository";
import { IChat } from "../../models/chat/chatModel";

class ChatService{
    private chatRepository:ChatRepository;

    constructor(chatRepository:ChatRepository){
        this.chatRepository=chatRepository
    }


    async createChat(participants: { participantId: string; role: "user" | "tutor"; }[]): Promise<IChat> {
        return await this.chatRepository.createChat(participants)
    }

   async getChatById(chatId: string): Promise<IChat | null>{
    return await this.chatRepository.getChatById(chatId)
   }


   async getChatsByParticipant(participantId: string): Promise<IChat[]>{

    return await this.chatRepository.getChatsByParticipant(participantId)
    }
    
    
   async updateLastMessage(
      chatId: string,
      message: string,
      timestamp: Date,
      unreadCount:number,
    ): Promise<void>{
        return await this.chatRepository.updateLastMessage(chatId,message,timestamp,unreadCount)
    }
}

export default ChatService;