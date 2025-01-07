import { Request, Response, NextFunction } from "express";
import JwtUtils from "../utils/jwtUtils";

export interface CustomRequest extends Request {
 user?:string;
 
 role?:"user" | "tutor";
  
}

const authMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '').trim();
   
    if (!token) {
      throw new Error('Authentication failed. Token missing.');
    }
   
    const decoded = JwtUtils.verifyToken(token)
    if (!decoded || typeof decoded !== "object" || (!decoded.userId && !decoded.tutorId)) {
      res.status(401).json({
        message: "Authentication failed. Invalid token.",
        details: "Token verification failed or invalid token structure.",
      });
      return
    }


   if(decoded.userId){
    req.user=decoded.userId;
    req.role="user";
   }else if(decoded.tutorId){
    req.user=decoded.tutorId;
    req.role="tutor";
   }else{

   res.status(401).json({
        message: "Authentication failed. Missing role information.",
        details: "Token payload does not contain user or tutor ID.",
      });
      return;

   }

    next();
    
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed.",
    error: error instanceof Error ? error.message : "Unknown error"
     });
    
  }
}

export default authMiddleware;
