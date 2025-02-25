import { Request, Response, NextFunction } from "express";
import JwtUtils from "../utils/jwtUtils";

export interface CustomRequest extends Request {
  user?: string;
  role?: string;
}

const authMiddleware = (req: CustomRequest, res: Response, next: NextFunction): void => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "").trim();

    if (!token) {
      res.status(401).json({
        message: "Authentication failed. Token missing.",
        details: "No authorization header found.",
      });
      return;
    }

    const decoded = JwtUtils.verifyToken(token);
    if (!decoded || typeof decoded !== "object") {
      res.status(401).json({
        message: "Authentication failed. Invalid token.",
        details: "Token verification failed.",
      });
      return;
    }

    
    const { role } = decoded as { role?: string };

    if (!role) {
      res.status(403).json({
        message: "Access denied.",
        details: "Role information missing from the token.",
      });
      return;
    }

   
    if ("userId" in decoded) {
      req.user = (decoded as { userId: string }).userId;
    } else if ("tutorId" in decoded) {
      req.user = (decoded as { tutorId: string }).tutorId;
    } else {
      res.status(401).json({
        message: "Authentication failed.",
        details: "Invalid token payload. Missing userId or tutorId.",
      });
      return;
    }

    req.role = role;
    next(); 
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      message: "Authentication failed.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export default authMiddleware;

