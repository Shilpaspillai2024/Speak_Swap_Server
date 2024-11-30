import UserService from "../../services/user/userService";
import { Request, Response } from "express";

class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async registerBasicDetails(req: Request, res: Response): Promise<void> {
    try {
      const {user,token} = await this.userService.registerBasicDetails(req.body);
      res.status(201).json({ message: "User registered successfully", user,token });
    } catch (error) {
      let errorMessage = "an unexpected error occured";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  }

  async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const response = await this.userService.sendOtp(email);
      res.status(200).json(response);
    } catch (error) {
      let errorMessage = "an unexpected error occured";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  }



  async verifyOtp(req:Request,res:Response):Promise<void>{
    try {
      const {token,otp} =req.body;

      if (!token || !otp) {
        res.status(400).json({ error: "Token and OTP are required" });
        return;
      }

      const userId=this.userService.verifyToken(token)
      const message=await this.userService.verifyOtp(userId,otp)

      
      res.status(200).json({message});

      
    } catch (error) {
      let errorMessage = "an unexpected error occured";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
      
    }
  }


  async setpassword(req:Request,res:Response):Promise<void>{
    try {

      const {token,password,confirmPassword}=req.body;

      if( password !== confirmPassword){
        res.status(400).json({error:"Password do not match"});
        return;
      }

      const userId=this.userService.verifyToken(token)
      
      const result=await this.userService.setPassword(userId,password);
      res.status(200).json({message:"Password Set Successfully",result})
      
    } catch (error) {
      let errorMessage = "an unexpected error occured";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
      
    }
  }



  async updateProfileDetails(req:Request,res:Response):Promise<void>{
    try {

      const {token,country,nativeLanguage,knownLanguages,learnLanguage,learnProficiency}=req.body
      
      if (!token || !country || !nativeLanguage || !learnLanguage) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }

      const userId=this.userService.verifyToken(token)
  
      // Update details
      const updatedUser = await this.userService.updateProfileDetails(userId, {
        country,
        nativeLanguage,
        knownLanguages,
        learnLanguage,
        learnProficiency,
      });
  
      res.status(200).json({ message: "Profile updated successfully", updatedUser });
     
    } catch (error) {

      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    
      
    }
  }
}

export default UserController;
