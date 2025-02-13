import { Server } from "socket.io";
import handleChatSocket from "./userSocket";
import handleTutorSession from "./sessionSocket";


const configureSocket=(io:Server)=>{
    handleChatSocket(io);
    handleTutorSession(io);
}

export default configureSocket;