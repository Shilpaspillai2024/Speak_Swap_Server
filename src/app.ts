import express from 'express';
import http from 'http'
import cors from 'cors';
import { json,urlencoded } from 'express';
import connectdb from './config/dbconfig';
import dotenv from 'dotenv'
import adminRoute from './routes/admin/adminRoute'
import userRoute from './routes/user/userRoute'
import tutorRoute from './routes/tutor/tutorRoute'
import chatRoute from './routes/chat/chatRoute'
import messageRoute from './routes/chat/messageRoute'
import cookieParser from 'cookie-parser'
import { Server } from 'socket.io';





dotenv.config()


const port=process.env.PORT || 5000
const app=express();

const server=http.createServer(app);

// initialize socket io with the server
const io=new Server(server,{
  cors:{
    origin: 'http://localhost:3000', // Allow frontend origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  },
  
  transports: ['websocket'], 
  
})

app.use(json());
app.use(urlencoded({extended:true}))

app.use(cookieParser());




app.use(cors({
  origin: 'http://localhost:3000',  // Allow only frontend origin
  credentials: true,  // Allow credentials like cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));






connectdb();

app.use('/admin',adminRoute)
app.use('/',userRoute)
app.use('/tutor',tutorRoute)


app.use('/chat',chatRoute)
app.use('/message',messageRoute)

app.get('/',(req,res)=>{
    res.send("welcome to speak swap")
})


//socket.io logic



io.on('connection',(socket)=>{
  console.log(`user connected ;${socket.id}`);
  console.log(`Transport used: ${socket.conn.transport.name}`);

  // join a chat room

  socket.on('joinRoom',(chatId)=>{
    
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat: ${chatId}`);
    socket.to(chatId).emit('userJoined', { userId: socket.id });

  })


  //handling sending messages

  socket.on('sendMessage',(data,callback)=>{

    if (!data?.chatId || !data?.message) {
      callback({ success: false, message: 'Invalid message data.' });
      return;
    }
    const {chatId,message}=data;

   const room=chatId
      io.to(room).emit('receiveMessage', { ...data, timestamp: new Date() });

    // io.to(room).emit('receiveMessage',data)
    
    callback({ success: true, message: 'Message sent successfully.' });
  });

  //handle disconnection

  socket.on('disconnect',()=>{
    console.log(`user ${socket.id} disconnected`)
  })
})



server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app