import { Server, Socket } from "socket.io";

const handleTutorSession = (io: Server) => {
    const activeSessions = new Map();

  
  
    io.on("connection", (socket: Socket) => {
      console.log(`[Socket] New connection: ${socket.id}`);
  
      socket.on("joinSession", ({ bookingId, userRole }) => {
        try {
          console.log("join session",bookingId)
          if (!bookingId) {
            console.error(`[Session Error] Missing bookingId from ${socket.id}`);
            socket.emit("sessionError", "Missing session details");
            return;
          }
  
          
          if (!activeSessions.has(bookingId)) {
            activeSessions.set(bookingId,{
                users:[],
                createdAt:new Date().toISOString(),
            });
            console.log(`[${new Date().toISOString()}] Created new active session for Booking ID: ${bookingId}`);
          }
         
  
          const session = activeSessions.get(bookingId);
          session.users.push({
            socketId: socket.id,
            userRole,
            joinedAt: new Date().toISOString()
          });
          
          socket.join(bookingId);
         
  
        
          socket.to(bookingId).emit("userJoinedSession", { 
            userId: socket.id, 
            userRole,
            timestamp: new Date().toISOString()
          });
  
          
          socket.emit("sessionInfo", { 
            message: "Joined session successfully",
            sessionId: bookingId,
            participantCount: session.users.length
          });
  
        } catch (error) {
          console.error(`[Session Error] Join failed:`, {
            socketId: socket.id,
            bookingId,
            error
          });
          socket.emit("sessionError", "Failed to join session");
        }
      });

    // WebRTC Signaling - Handle Offer
    socket.on("offer", ({ offer, bookingId }) => {
        console.log("start sending offer")
      if (!offer || !bookingId || !activeSessions.has(bookingId)) {
        console.warn(`[${new Date().toISOString()}] [ERROR] Invalid offer or expired session from ${socket.id}`);
        socket.emit("sessionError", "Invalid offer or session ended");
        return;
      }

      console.log(`[${new Date().toISOString()}] [OFFER] Offer sent by ${socket.id} in Booking: ${bookingId}`);
      socket.to(bookingId).emit("receivevideoOffer", { offer, senderId: socket.id });
    });

    // WebRTC Signaling - Handle Answer
    socket.on("answer", ({ answer, bookingId }) => {
        console.log("sendAnswer")
      if (!answer || !bookingId || !activeSessions.has(bookingId)) {
        console.warn(`[${new Date().toISOString()}] [ERROR] Invalid answer or expired session from ${socket.id}`);
        socket.emit("sessionError", "Invalid answer or session ended");
        return;
      }

      console.log(`[${new Date().toISOString()}] [ANSWER] Answer sent by ${socket.id} in Booking: ${bookingId}`);
      socket.to(bookingId).emit("receivevideoAnswer", { answer, senderId: socket.id });
    });

    // WebRTC Signaling - Handle ICE Candidates
    socket.on("candidate", ({ candidate, bookingId }) => {
      if (!candidate || !bookingId || !activeSessions.has(bookingId)) {
        console.warn(`[${new Date().toISOString()}] [ERROR] Invalid candidate or expired session from ${socket.id}`);
        socket.emit("sessionError", "Invalid candidate or session ended");
        return;
      }

      console.log(`[${new Date().toISOString()}] [CANDIDATE] ICE Candidate sent by ${socket.id} in Booking: ${bookingId}`);
      socket.to(bookingId).emit("candidate", { candidate, senderId: socket.id });
    });

    // Handle early session termination
    socket.on("endSession", ({ bookingId}) => {
      if (!bookingId || !activeSessions.has(bookingId)) {
        console.warn(`[${new Date().toISOString()}] [ERROR] Invalid session end request from ${socket.id}`);
        socket.emit("sessionError", "Invalid session");
        return;
      }

      console.log(`[${new Date().toISOString()}] [SESSION END] Session ended early by ${socket.id} for Booking ${bookingId}`);
      socket.to(bookingId).emit("sessionEnded", { enderId: socket.id,
        message:`session ended`
       });

      activeSessions.delete(bookingId);
      socket.leave(bookingId);
    });




    socket.on("chatMessage", ({ message, bookingId }) => {
      if (!bookingId || !activeSessions.has(bookingId)) {
        console.warn(`[${new Date().toISOString()}] [ERROR] Invalid chat message or expired session from ${socket.id}`);
        socket.emit("sessionError", "Invalid session");
        return;
      }
    
      console.log(`[${new Date().toISOString()}] [CHAT] Message sent in session ${bookingId}`);
      socket.to(bookingId).emit("chatMessage", message);
    });

    socket.on("disconnect", () => {
      console.log(`[${new Date().toISOString()}] User disconnected: ${socket.id}`);
    });
  });
};

export default handleTutorSession;
