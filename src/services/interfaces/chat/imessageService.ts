import { IMessage } from "../../../models/chat/messageModel";

interface IMessageService {
  createMessage(
    chatId: string,
    senderId: string,
    senderRole: "user" | "tutor",
    message: string
  ): Promise<IMessage>;

  getMessagesByChatId(chatId: string): Promise<IMessage[]>;

  markMessagesAsRead(chatId: string, participantId: string): Promise<void>;
 

}

export default IMessageService;
