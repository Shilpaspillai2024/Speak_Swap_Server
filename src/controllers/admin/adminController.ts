import AdminService from "../../services/admin/adminService";
import { Request,Response } from "express";
import JwtUtils from "../../utils/jwtUtils";



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
                secure:process.env.NODE_ENV ==="production",
                sameSite:"none",
                maxAge:7 * 24 * 60 * 60 * 1000,
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
}

export default AdminController