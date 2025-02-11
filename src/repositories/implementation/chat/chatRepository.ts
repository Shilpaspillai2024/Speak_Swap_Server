import { IChat, Chat } from "../../../models/chat/chatModel";
import { IChatRepository } from "../../interfaces/chat/ichatRepository";
import { User } from "../../../models/user/userModel";
import { Tutor } from "../../../models/tutor/tutorModel";


class ChatRepository implements IChatRepository {
  async createChat(
    participants: { participantId: string; role: "user" | "tutor" }[]
  ): Promise<IChat> {
    try {
      const participantIds = participants
        .map((p) => p.participantId.toString())
        .sort()
        .join("_");

      let existingChat = await Chat.findOne({ participantIds });

      if (existingChat) {
        return existingChat;
      }

      
       const unreadCount = participants.map(participant => ({
        participantId: participant.participantId,
        count: 0
      }));

      const chat = new Chat({
        participantIds,
        participants: participants.map((participant) => ({
          participantId: participant.participantId,
          role: participant.role,
        })),
        unreadCount
      });

      console.log("createdchat", chat);
      return await chat.save();
    } catch (error: any) {
      throw new Error(`Failed to create chat: ${error.message}`);
    }
  }

  async getChatById(chatId: string): Promise<IChat | null> {
    try {
      return await Chat.findById(chatId).populate({
        path: "participants.participantId",
        select: "name profilePhoto fullName role",
      });
    } catch (error: any) {
      throw new Error(`Failed to fetch chat by ID: ${error.message}`);
    }
  }



  async getChatsByParticipant(participantId: string): Promise<IChat[]> {
    try {
      const chats = await Chat.find({
        "participants.participantId": participantId,
      })
        .sort({ lastActivity: -1 })
        .populate({
          path: "participants.participantId",
          select: "fullName profilePhoto name profilePhoto",
        })
        .exec();

      for (const chat of chats) {
        for (const participant of chat.participants) {
          if (participant.role === "user") {
            const user = await User.findById(participant.participantId).select(
              "fullName profilePhoto"
            );
            if (user) {
              participant.name = user.fullName;
              participant.profilePhoto = user.profilePhoto;
            } else {
              console.warn(
                `User with ID ${participant.participantId} not found`
              );
            }
          } else if (participant.role === "tutor") {
            const tutor = await Tutor.findById(
              participant.participantId
            ).select("name profilePhoto");
            if (tutor) {
              participant.name = tutor.name;
              participant.profilePhoto = tutor.profilePhoto;
            } else {
              console.warn(
                `Tutor with ID ${participant.participantId} not found`
              );
            }
          }
        }
      }
      console.log("chats from fetch particpiants", chats);
      return chats;
    } catch (error: any) {
      throw new Error(
        `Failed to fetch chats for participant: ${error.message}`
      );
    }
  }

  async updateLastMessage(chatId: string, message: string, timestamp: Date): Promise<void> {
      try {
          await Chat.findByIdAndUpdate(chatId, {
            lastMessage: { message, timestamp },
            lastActivity: timestamp,
          });
        } catch (error:any) {
          throw new Error(`Failed to update last message: ${error.message}`);
        }
  }

  
}

export default ChatRepository;
