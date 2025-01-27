import { Request,Response } from "express";
import IChatService from "../../services/interfaces/chat/ichatService";


class ChatController{
    private chatService:IChatService;
     

    constructor(chatService:IChatService){
        this.chatService=chatService
    }


    async createChat(req:Request,res:Response):Promise<void>{
           
    console.log("calling createchat backend")
        const{participants}=req.body;
        console.log("CreateChat Request Body:", req.body);

        try {
            const chat=await this.chatService.createChat(participants)
            res.status(201).json(chat)
            console.log(chat)
        } catch (error:any) {
            res.status(500).json({ error: error.message });
        }
    }


    async getChatById(req:Request,res:Response):Promise<void>{

        const{chatId}=req.params;
        try {

            const chat=await this.chatService.getChatById(chatId)

            if(chat){
                res.status(200).json(chat)

               
            }else{
                res.status(404).json({ message: "Chat not found" });
            }
            
        } catch (error:any) {
            res.status(500).json({ error: error.message }); 
        }

    }


    async getChatsByParticipant(req:Request,res:Response):Promise<void>{
        const {participantId}=req.params;
        try {

            const chats=await this.chatService.getChatsByParticipant(participantId)
            res.status(200).json(chats)
            
        } catch (error:any) {
            res.status(500).json({ error: error.message });
            
        }
    }


    async updateLastMessage(req:Request,res:Response):Promise<void>{
        const{chatId,message,timestamp,unreadCount}=req.body
        try {
           
            await this.chatService.updateLastMessage(chatId,message,new Date(timestamp),unreadCount)
            res.status(200).json({success:true})
        } catch (error:any) {
            res.status(500).json({ error: error.message });
        }
    }


}

export default ChatController