import { Request,Response,NextFunction } from "express";
import JwtUtils  from "../utils/jwtUtils";
import { HttpStatus } from "../constants/httpStatus";

export interface CustomRequest extends Request{
    admin?:string;
    role?:string;
}


const adminAuthentcationMiddleware=(req:CustomRequest,res:Response,next:NextFunction)=>{
    try {
        const token=req.header("Authorization")?.replace("Bearer ","").trim();
        console.log("Token from header:", token);
        if(!token){
             res.status(HttpStatus.UNAUTHORIZED).json({message:"Authentication failed .Token missing",
                details:"No authorization header found"
             })
             return

        }
        
        const decoded=JwtUtils.verifyToken(token)

        console.log("Backend Decoded Token Payload:", decoded);
        if (!decoded || typeof decoded !== "object") {
          res.status(HttpStatus.UNAUTHORIZED).json({
            message: "Authentication failed. Invalid token",
            details: "Token verification failed",
          });
          return;
        }
    
        // Extract email and role
        const { email, role } = decoded as { email: string; role: string };
    
        if (!email || !role) {
          res.status(HttpStatus.UNAUTHORIZED).json({
            message: "Authentication failed",
            details: "Invalid token payload",
          });
          return;
        }
    
        req.admin = email;
        req.role = role;
    
        if (role !== "admin") {
          res.status(HttpStatus.FORBIDDEN).json({
            message: "Access denied",
            details: "You do not have the required permissions",
          });
          return;
        }
    
        next();
      } catch (error) {
        console.error("Authentication error:", error);
        res.status(HttpStatus.UNAUTHORIZED).json({
          message: "Authentication failed.",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    };
    
export default  adminAuthentcationMiddleware