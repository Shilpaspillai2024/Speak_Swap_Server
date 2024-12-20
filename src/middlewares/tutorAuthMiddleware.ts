import { Request, Response, NextFunction } from "express";
import JwtUtils from "../utils/jwtUtils";

export interface CustomRequest extends Request {
  tutor?: string;
  
}

const tutorAuthMiddleware = async (req: CustomRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '').trim();
    console.log("tutor side auth")
    if (!token) {
      throw new Error('Authentication failed. Token missing.');
    }
   
    const decoded = JwtUtils.verifyToken(token)
    if (!decoded || typeof decoded !== "object" || !decoded.tutorId) {
      res.status(401).json({
        message: "Authentication failed. Invalid token.",
        details: "Token verification failed or invalid token structure.",
      });
      return
    }


    req.tutor = decoded.tutorId;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ message: "Authentication failed.",
    error: error instanceof Error ? error.message : "Unknown error"
     });
    
  }
}

export default tutorAuthMiddleware;
