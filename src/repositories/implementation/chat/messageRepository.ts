import { IMessage,Message } from "../../../models/chat/messageModel";
import { IMessageRepository } from "../../interfaces/chat/imessageRepository";
import { Chat } from "../../../models/chat/chatModel";

class MessageRepository implements IMessageRepository{


    async createMessage(chatId: string, senderId: string, senderRole: "user" | "tutor", message: string): Promise<IMessage> {
        try {

            const newMessage= new Message({
                chatId,
                senderId,
                senderRole,
               
                message,
                isRead:false
            });


             const savedMessage = await newMessage.save();

              // Increment unread count for all participants except the sender
              await Chat.findByIdAndUpdate(
                chatId,
                {
                  $inc: {
                    'unreadCount.$[elem].count': 1
                  },
                  lastMessage: {
                    message: message,
                    timestamp: new Date()
                  },
                  lastActivity: new Date()
                },
                {
                  arrayFilters: [
                    { 'elem.participantId': { $ne: senderId } }
                  ],
                  new: true
                }
              );
           

               return savedMessage;
            // return await newMessage.save();
            
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
            );
            const result = await Chat.findByIdAndUpdate(
              chatId,
              {
                $set: {
                  "unreadCount.$[elem].count": 0
                }
              },
              {
                arrayFilters: [
                  { "elem.participantId": participantId }
                ],
                new: true
              }
            );

            if (!result) {
              throw new Error('Failed to update chat unread count');
            }
            
        } catch (error:any) {
            throw new Error(`Failed to mark messages as read: ${error.message}`);
            
        }
    }


    async getUnreadCount(participantId: string): Promise<number> {
        try {
          const chats = await Chat.find({
            'participants.participantId': participantId
          });
    
          let totalUnread = 0;
          chats.forEach(chat => {
            const unreadData = chat.unreadCount?.find(
              uc => uc.participantId.toString() === participantId
            );
            if (unreadData && typeof unreadData.count === 'number') {
              totalUnread += unreadData.count;
            }
          });
    
          return totalUnread;
        } catch (error: any) {
          throw new Error(`Failed to get unread count: ${error.message}`);
        }
      }
    
}

export default MessageRepository;