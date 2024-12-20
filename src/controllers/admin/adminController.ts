import AdminService from "../../services/admin/adminService";
import { Request,Response } from "express";
import JwtUtils from "../../utils/jwtUtils";
import { CustomRequest } from "../../middlewares/adminAuthMiddleware";



class AdminController{
    private adminService:AdminService;

    constructor(adminService:AdminService){
        this.adminService=adminService
    }


    async postLogin(req:Request,res:Response):Promise<void>{
        try {
            const{ email,password }=req.body;

            const isAdmin=await this.adminService.findByEmail(email)

            if(!isAdmin){
                res.status(401).json({message:"Incorrect email"})
                return
            }

           
            if(password !==isAdmin.password){
                 res.status(401).json({message:"incorrect password"})
                 return
            }


            const payload={email:isAdmin.email}
            const accessToken=JwtUtils.generateAccessToken(payload)
            const refreshToken=JwtUtils.generateRefreshToken(payload)


            res.cookie("adminRefreshToken",refreshToken,{
                httpOnly:true,
                secure:process.env.NODE_ENV==="production",
                sameSite:"none",
                maxAge:7 * 24 * 60 * 60 * 1000,// 7days
            });
            console.log("success")

            res.status(200).json({
                message:"Login SuccessFull",
                accessToken,
                isAdmin,
            });
            
        } catch (error) {
            let errorMessage= "An unexpected error Occured"
            if(error instanceof Error){
                 errorMessage=error.message
            }
            console.error("Error details:", error);  
            res.status(500).json({message:errorMessage})
            
        }
    }


    async refreshToken(req:Request,res:Response):Promise<void>{
        try {

           
            const refreshToken =req.cookies.adminRefreshToken;
            
            if(!refreshToken){
                res.status(401).json({message:"Refresh token missing"});
                return;
            }

            const decoded =JwtUtils.verifyToken(refreshToken,true);
          

          
            if(!decoded){
                res.status(401).json({message:"Invalid Refresh token"});
                return;

            }
            const payload={email:(decoded as {email:string}).email}
        

            const newAccessToken=JwtUtils.generateAccessToken(payload)
           
            console.log("new AccessToken refreshed:",newAccessToken)
        
            res.status(200).json({accessToken:newAccessToken})
        } catch (error) {
            console.error("Error in token refresh:",error);
            res.status(500).json({message:"An unexpected error occured"})


            
        }
    }


    // get all users
    async getAllUser(req:CustomRequest,res:Response):Promise<void>{
        try {
            console.log(req.admin)

            if(!req.admin){
                res.status(403).json({message:"Access denied Admins only"});
                return;
            }
            const users=await this.adminService.getAllUser()
            console.log("Fetched users:", users);
            res.status(200).json({ message: "Users fetched successfully", users });
          
        } catch (error) {
          console.error("Error fetching users:", error);
          res.status(500).json({message:"fetch user details error"})
          
        }
      }





   // block unblock user

   async blockUnblockUser(req:CustomRequest,res:Response):Promise<void>{
    try {
        
        if(!req.admin){
            res.status(403).json({message:"Access denied Admins only"});
            return;

        }

        const {userId}=req.params;
        const{isActive}=req.body;


        if(typeof isActive !=='boolean'){
            res.status(400).json({ message: "Invalid 'isActive' value. Must be a boolean." });
            return;
        }

        const updateStatus=await this.adminService.updateUserStatus(userId,isActive)

        if (!updateStatus) {
            res.status(404).json({ message: "User not found." });
            return;
          }

          res.status(200).json({
            message: `User ${isActive ? "unblocked" : "blocked"} successfully.`,
            user: updateStatus,
          });
    } catch (error) {
        console.error("Error updating user status:", error);
        res.status(500).json({ message: "An unexpected error occurred." });
        
    }
   }
   
}

export default AdminController