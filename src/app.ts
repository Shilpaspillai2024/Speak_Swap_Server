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

app.use(cors({
  origin: 'http://localhost:3000',  // Allow only frontend origin
  credentials: true,  // Allow credentials like cookies
}));


app.use(json());
app.use(urlencoded({extended:true}))

app.use(cookieParser());

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