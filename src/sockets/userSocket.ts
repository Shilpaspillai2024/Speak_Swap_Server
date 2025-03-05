import { Server ,Socket} from "socket.io";


//socket.io logic

interface MarkReadData {
  chatId: string;
  userId: string;
}

const usersOnline = new Map();


const handleChatSocket=(io:Server)=>{

io.on("connection", (socket:Socket) => {
    console.log(`user connected ;${socket.id}`);
    console.log(`Transport used: ${socket.conn.transport.name}`);
  
    socket.on("userOnline", (userId) => {
      usersOnline.set(userId, socket.id);
      io.emit("updateUserStatus", { userId, isOnline: true });
    });
  
    socket.on("joinRoom", (chatId) => {
      socket.join(chatId);
      console.log(`User ${socket.id} joined chat: ${chatId}`);
      socket.to(chatId).emit("userJoined", { userId: socket.id });
    });
  
   
  
   
    //handling sending messages
  
    socket.on("sendMessage", (data, callback) => {
      if (!data?.chatId || !data?.message) {
        callback({ success: false, message: "Invalid message data." });
        return;
      }
      const { chatId, message } = data;
  
      const room = chatId;
      io.to(room).emit("receiveMessage", { ...data, timestamp: new Date() });
  
      
  
      callback({ success: true, message: "Message sent successfully." });
    });
  
    



    // handling mark as read
    socket.on("markAsRead", async (data: MarkReadData, callback) => {
      try {
        const { chatId, userId } = data;
        
        if (!chatId || !userId) {
          callback?.({ success: false, message: "Invalid data for marking messages as read." });
          return;
        }

        // Emit to all users in the chat that messages were read
        socket.emit("messagesRead", { chatId, readBy: userId });
        socket.to(chatId).emit("messagesRead", { chatId, readBy: userId });

        callback?.({ 
          success: true, 
          message: "Messages marked as read successfully." 
        });

      } catch (error) {
        console.error("Error in markAsRead socket handler:", error);
        callback?.({ 
          success: false, 
          message: "Failed to mark messages as read." 
        });
      }
    });
   
  
    socket.on("initiateCall", ({ chatId,callerName }) => {
      const videoRoomId = `${chatId}-video`;
       console.log("callerName",callerName)
      console.log(`Call initiated by ${socket.id} for video room ${videoRoomId}`);
  
      socket.join(videoRoomId);
      socket.broadcast.emit('incomingCall', {
        callerId: socket.id,
        videoRoomId,
        chatId,
        callerName
      })
    });
  
  
  
    socket.on("rejectCall", ({ chatId }) => {
      socket.to(chatId).emit("callRejected", {
        rejecterId: socket.id,
        chatId,
      });
    });
    
  
    socket.on("acceptCall", ({ videoRoomId }) => {
     
  
      if (!videoRoomId) {
        console.log("❌ Invalid videoRoomId for call acceptance");
        return;
      }
      console.log(`Call accepted in room ${videoRoomId} by ${socket.id}`);
      socket.join(videoRoomId);
  
      const room = io.sockets.adapter.rooms.get(videoRoomId);
      const numParticipants = room ? room.size : 0;
      console.log(`👥 Participants in video room: ${numParticipants}`);
  
  
      socket.to(videoRoomId).emit("callAccepted", {
        accepterId: socket.id,
        videoRoomId,
      });
    });
  
    // WebRTC signaling: send answer
  
    socket.on("sendOffer", ({ offer, videoRoomId }) => {
      if (!offer || !videoRoomId) {
        console.log("❌ Invalid offer data");
        return;
      }
  
      console.log(`📤 Sending offer in room ${videoRoomId}`);
      console.log(`SDP Type: ${offer.type}`);
      
      socket.to(videoRoomId).emit("receiveOffer", {
        offer,
        senderId: socket.id
      });
    });
  
  
  
  
    socket.on("sendAnswer", ({ answer, videoRoomId }) => {
      if (!answer || !videoRoomId) {
        console.log("❌ Invalid answer data");
        return;
      }
  
      console.log(`📤 Sending answer in room ${videoRoomId}`);
      console.log(`SDP Type: ${answer.type}`);
      
      socket.to(videoRoomId).emit("receiveAnswer", {
        answer,
        senderId: socket.id
      });
    });
  
    
    socket.on("sendCandidate", ({ candidate, videoRoomId }) => {
      if (!candidate || !videoRoomId) {
        console.log("❌ Invalid ICE candidate data");
        return;
      }
  
      console.log(`🧊 ICE candidate for room ${videoRoomId}`);
      console.log(`Candidate: ${candidate.candidate}`);
      
      socket.to(videoRoomId).emit("receiveCandidate", {
        candidate,
        senderId: socket.id
      });
    });
  
    socket.on("endCall", ({ videoRoomId }) => {
      if (!videoRoomId) {
        console.log("❌ Invalid videoRoomId for ending call");
        return;
      }
  
      console.log(`⏹️ Ending call in room ${videoRoomId}`);
      socket.to(videoRoomId).emit("remoteDisconnect", {
        enderId: socket.id
      });
      
      // Leave the video room
      socket.leave(videoRoomId);
    });
  
    //handle disconnection
  
    socket.on("disconnect", () => {
      console.log(`user ${socket.id} disconnected`);

       const userId = [...usersOnline.entries()].find(([id, sId]) => sId === socket.id)?.[0];
    if (userId) {
      usersOnline.delete(userId);
      io.emit("updateUserStatus", { userId, isOnline: false });
    }
    });
  });

}

export default handleChatSocket;