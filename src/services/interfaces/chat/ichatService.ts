import { IChat } from "../../../models/chat/chatModel";

interface IChatService {
  createChat(participants: { participantId: string; role: "user" | "tutor" }[]): Promise<IChat>;

  getChatById(chatId: string): Promise<IChat | null>;

  getChatsByParticipant(participantId: string): Promise<IChat[]>;

  updateLastMessage(
    chatId: string,
    message: string,
    timestamp: Date,
  ): Promise<void>;
}

export default IChatService;