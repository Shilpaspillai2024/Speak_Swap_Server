import { Request,Response,NextFunction } from "express";
import JwtUtils  from "../utils/jwtUtils";

export interface CustomRequest extends Request{
    admin?:string;
}


const adminAuthentcationMiddleware=(req:CustomRequest,res:Response,next:NextFunction)=>{
    try {
        const token=req.header("Authorization")?.replace("Bearer","").trim();
        console.log("Token from header:", token);
        if(!token){
             res.status(401).json({message:"Authentication failed .Token missing",
                details:"No authorization header found"
             })
             return

        }
        
        const decoded=JwtUtils.verifyToken(token)
        if(!decoded){
        res.status(401).json({message:"Authentication failed .Invalid token",
                deatils:"Token verification failed"
            })
            return
        }

        if (typeof decoded === 'object' && 'email' in decoded) {
            req.admin = (decoded as { email: string }).email;
            next();
          } else {
             res.status(401).json({
              message: "Authentication failed",
              details: "Invalid token payload"
            });
            return
          }

    } catch (error) {
        console.error("Authentication error:", error);
        res.status(401).json({ message: "Authentication failed.",
        error: error instanceof Error ? error.message : "Unknown error"
         });
        
    }
}

export default  adminAuthentcationMiddleware