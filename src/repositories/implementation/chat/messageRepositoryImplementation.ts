import { IMessage,Message } from "../../../models/chat/messageModel";
import { MessageRepository } from "../../chat/messageRepository";


class MessageRepositoryImplementation implements MessageRepository{
    // async createMessage(chatId: string, senderId: string, senderRole: "user" | "tutor",reciepientId:string,reciepientRole:"user" | "tutor", message: string): Promise<IMessage> {
    //     try {

    //         const newMessage= new Message({
    //             chatId,
    //             senderId,
    //             senderRole,
    //             reciepientId,
    //             reciepientRole,
    //             message,
    //         });
    //         return await newMessage.save();
            
    //     } catch (error:any) {
    //         throw new Error(`Failed to create message: ${error.message}`);
    //     }
    // }

    async createMessage(chatId: string, senderId: string, senderRole: "user" | "tutor", message: string): Promise<IMessage> {
        try {

            const newMessage= new Message({
                chatId,
                senderId,
                senderRole,
               
                message,
            });
            return await newMessage.save();
            
        } catch (error:any) {
            throw new Error(`Failed to create message: ${error.message}`);
        }
    }




    async getMessagesByChatId(chatId: string): Promise<IMessage[]> {
        return Message.find({chatId}).sort({timestamp:1})
    }

    async markMessagesAsRead(chatId: string, participantId: string): Promise<void> {
        try {

            await Message.updateMany({
                chatId,senderId:{$ne:participantId},isRead:false},
                {isRead:true}
            )
            
        } catch (error:any) {
            throw new Error(`Failed to mark messages as read: ${error.message}`);
            
        }
    }
}

export default MessageRepositoryImplementation