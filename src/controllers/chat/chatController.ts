import { Request,Response } from "express";
import IChatService from "../../services/interfaces/chat/ichatService";
import { HttpStatus } from "../../constants/httpStatus";


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
            res.status(HttpStatus.CREATED).json(chat)
            console.log(chat)
        } catch (error:any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }


    async getChatById(req:Request,res:Response):Promise<void>{

        const{chatId}=req.params;
        try {

            const chat=await this.chatService.getChatById(chatId)

            if(chat){
                res.status(HttpStatus.OK).json(chat)

               
            }else{
                res.status(HttpStatus.NOT_FOUND).json({ message: "Chat not found" });
            }
            
        } catch (error:any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message }); 
        }

    }


    async getChatsByParticipant(req:Request,res:Response):Promise<void>{
        const {participantId}=req.params;
        try {

            const chats=await this.chatService.getChatsByParticipant(participantId)
            res.status(HttpStatus.OK).json(chats)
            
        } catch (error:any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
            
        }
    }


    async updateLastMessage(req:Request,res:Response):Promise<void>{
        const{chatId,message,timestamp}=req.body
        try {
           
            await this.chatService.updateLastMessage(chatId,message,new Date(timestamp))
            res.status(HttpStatus.OK).json({success:true})
        } catch (error:any) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.message });
        }
    }


}

export default ChatController