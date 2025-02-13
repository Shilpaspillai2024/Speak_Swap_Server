import { Server } from "socket.io";
import { Server  as HttpServer} from 'http'
import configureSocket from "../sockets/socketHandler";

const initializeSocket =(server:HttpServer)=>{


const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Allow frontend origin
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },

  transports: ["websocket"],
});

configureSocket(io);
return io;
}

export default initializeSocket;