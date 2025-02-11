import express from "express";
import http from "http";
import cors from "cors";
import { json, urlencoded } from "express";
import connectdb from "./config/dbconfig";
import dotenv from "dotenv";
import adminRoute from "./routes/admin/adminRoute";
import userRoute from "./routes/user/userRoute";
import tutorRoute from "./routes/tutor/tutorRoute";
import chatRoute from "./routes/chat/chatRoute";
import messageRoute from "./routes/chat/messageRoute";
import bookingRoute from "./routes/booking/bookingRoute";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import morgan from "morgan";
import logger from "./middlewares/logger";

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

const server = http.createServer(app);

// initialize socket io with the server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow frontend origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },

  transports: ["websocket"],
});

app.use(json());
app.use(urlencoded({ extended: true }));

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:3000", // Allow only frontend origin
    credentials: true, // Allow credentials like cookies
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
  })
);

connectdb();

app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

app.use("/admin", adminRoute);
app.use("/", userRoute);
app.use("/tutor", tutorRoute);

app.use("/chat", chatRoute);
app.use("/message", messageRoute);

app.use("/booking", bookingRoute);

app.get("/", (req, res) => {
  res.send("welcome to speak swap");
});

//socket.io logic




io.on("connection", (socket) => {
  console.log(`user connected ;${socket.id}`);
  console.log(`Transport used: ${socket.conn.transport.name}`);

 

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

    // io.to(room).emit('receiveMessage',data)

    callback({ success: true, message: "Message sent successfully." });
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
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
