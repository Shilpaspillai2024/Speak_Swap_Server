import UserService from "../../services/user/userService";
import { Request, Response } from "express";

class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async registerBasicDetails(req: Request, res: Response): Promise<void> {
    try {
      const user = await this.userService.registerBasicDetails(req.body);
      res.status(201).json({ message: "User registered successfully", user });
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
      const {email,otp} =req.body;
      const message=await this.userService.verifyOtp(email,otp)
      res.status(200).json({message});

      
    } catch (error) {
      let errorMessage = "an unexpected error occured";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
      
    }
  }
}

export default UserController;
