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
import geoRoute from "./routes/geo/geoRoute";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import logger from "./middlewares/logger";
import initializeSocket from "./config/socket";


dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

const server = http.createServer(app);



const io=initializeSocket(server);

app.use(json({limit:"50mb"}));
app.use(urlencoded({ extended: true,limit:"50mb"}));

app.use(cookieParser());

const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(",").map(origin => origin.trim()).filter(Boolean) 
    : [];

console.log("Allowed Origins:", allowedOrigins);

app.use(cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : "", 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"],
}));


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

app.use("/geo",geoRoute);

app.use("/chat", chatRoute);
app.use("/message", messageRoute);

app.use("/booking", bookingRoute);

app.get("/", (req, res) => {
  res.send("welcome to speak swap");
});


server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
