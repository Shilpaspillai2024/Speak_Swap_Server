import { IMessage, Message } from "../../../models/chat/messageModel";
import { IMessageRepository } from "../../interfaces/chat/imessageRepository";
import { Chat } from "../../../models/chat/chatModel";

class MessageRepository implements IMessageRepository {
  async createMessage(
    chatId: string,
    senderId: string,
    senderRole: "user" | "tutor",
    message: string
  ): Promise<IMessage> {
    try {
      const newMessage = new Message({
        chatId,
        senderId,
        senderRole,

        message,
      });

      console.log("newMessage before save:", newMessage);

      const savedMessage = await newMessage.save();
      console.log("savedMessage after save:", savedMessage);

      await Chat.findByIdAndUpdate(
        chatId,
        {
          $inc: {
            "unreadCount.$[elem].count": 1,
          },
          lastMessage: {
            message: message,
            timestamp: new Date(),
          },
          lastActivity: new Date(),
        },
        {
          arrayFilters: [{ "elem.participantId": { $ne: senderId } }],
          new: true,
        }
      );

      console.log("savedMessage :", savedMessage);
      return savedMessage;
    } catch (error: any) {
      throw new Error(`Failed to create message: ${error.message}`);
    }
  }

  async getMessagesByChatId(chatId: string): Promise<IMessage[]> {
    return Message.find({ chatId }).sort({ timestamp: 1 });
  }

  async markMessagesAsRead(
    chatId: string,
    participantId: string
  ): Promise<void> {
    try {
      await Message.updateMany(
        {
          chatId,
          senderId: { $ne: participantId },
          isRead: false,
        },
        {
          $set: { isRead: true },
        }
      );
      
      const result = await Chat.findOneAndUpdate(
        {
          _id: chatId,
          "unreadCount.participantId": participantId,
        },
        {
          $set: { "unreadCount.$.count": 0 },
        },
        { new: true }
      );

      if (!result) {
        throw new Error("Failed to update chat unread count");
      }
    } catch (error: any) {
      throw new Error(`Failed to mark messages as read: ${error.message}`);
    }
  }

 
}

export default MessageRepository;
