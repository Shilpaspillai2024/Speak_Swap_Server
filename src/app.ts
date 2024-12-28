import express from 'express';
import cors from 'cors';
import { json,urlencoded } from 'express';
import connectdb from './config/dbconfig';
import dotenv from 'dotenv'
import adminRoute from './routes/admin/adminRoute'
import userRoute from './routes/user/userRoute'
import tutorRoute from './routes/tutor/tutorRoute'
import cookieParser from 'cookie-parser'




dotenv.config()


const port=process.env.PORT || 5000
const app=express();

app.use(json());
app.use(urlencoded({extended:true}))

app.use(cookieParser());


// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   next();
// });

app.use(cors({
  origin: 'http://localhost:3000',  // Allow only frontend origin
  credentials: true,  // Allow credentials like cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie']
}));





// app.use((req, res, next) => {
//   console.log('Request path:', req.path);
//   console.log('Request cookies:', req.cookies);
//   console.log('Cookie header:', req.headers.cookie);
//   next();
// });

connectdb();

app.use('/admin',adminRoute)
app.use('/',userRoute)
app.use('/tutor',tutorRoute)

app.get('/',(req,res)=>{
    res.send("welcome to speak swap")
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

export default app