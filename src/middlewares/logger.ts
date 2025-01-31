import { createLogger,format,transports } from "winston";
import 'winston-daily-rotate-file';
import path from 'path';


const logDirectory=path.join(__dirname,'../logs');

const dailyRotateFileTransport=new transports.DailyRotateFile({
    filename: 'application-%DATE%.log',
    dirname: logDirectory,               
    datePattern: 'YYYY-MM-DD',           
    maxFiles: '7d',                      
    zippedArchive: true,             
  });

  // Create the Winston logger
const logger = createLogger({
    level: 'info',  
    format: format.combine(
      format.timestamp(),   
      format.json()         
    ),
    transports: [
      new transports.Console({ 
        format: format.combine(
          format.colorize(),    
          format.simple()       
        ),
      }),
      dailyRotateFileTransport,   
    ],
  });

  export default logger;
  
  