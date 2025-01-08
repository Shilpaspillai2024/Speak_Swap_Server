import UserService from "../../services/user/userService";
import { Request, Response } from "express";
import JwtUtils from "../../utils/jwtUtils";
// import { CustomRequest } from "../../middlewares/authenticationMiddleware";
import { CustomRequest } from "../../middlewares/authMiddleware";

class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  async registerBasicDetails(req: Request, res: Response): Promise<void> {
    try {
      const { user, token } = await this.userService.registerBasicDetails(
        req.body
      );
      res
        .status(201)
        .json({ message: "User registered successfully", user, token });
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
      const { token } = req.body;
      if (!token) {
        res.status(400).json({ error: "Token is requied" });
        return;
      }
      const response = await this.userService.sendOtp(token);
      res.status(200).json(response);
    } catch (error) {
      let errorMessage = "an unexpected error occured";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { token, otp } = req.body;

      if (!token || !otp) {
        res.status(400).json({ error: "Token and OTP are required" });
        return;
      }

      const userId = this.userService.verifyToken(token);
      const message = await this.userService.verifyOtp(userId, otp);

      res.status(200).json({ message });
    } catch (error) {
      let errorMessage = "an unexpected error occured";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  }

  async setpassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        res.status(400).json({ error: "Password do not match" });
        return;
      }

      const userId = this.userService.verifyToken(token);

      if (!userId) {
        console.error("Invalid or expired token");
        res.status(400).json({ error: "Invalid or expired token" });
        return;
      }

      const result = await this.userService.setPassword(userId, password);
      res.status(200).json({ message: "Password Set Successfully", result });
    } catch (error) {
      let errorMessage = "an unexpected error occured";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  }

  async updateProfileDetails(req: Request, res: Response): Promise<void> {
    try {
      const {
        token,
        country,
        nativeLanguage,
        knownLanguages,
        learnLanguage,
        learnProficiency,
      } = req.body;

      if (!token || !country || !nativeLanguage || !learnLanguage) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }

      const userId = this.userService.verifyToken(token);

      // Update details
      const updatedUser = await this.userService.updateProfileDetails(userId, {
        country,
        nativeLanguage,
        knownLanguages,
        learnLanguage,
        learnProficiency,
      });

      res
        .status(200)
        .json({ message: "Profile updated successfully", updatedUser });
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  }

  async updateInterest(req: Request, res: Response): Promise<void> {
    try {
      const { token, talkAbout, learningGoal, whyChat } = req.body;

      if (!token || !talkAbout || !learningGoal || !whyChat) {
        res.status(400).json({ error: "All fields are required" });
        return;
      }

      const userId = this.userService.verifyToken(token);
      const updatedUser = await this.userService.updateInterest(userId, {
        talkAbout,
        learningGoal,
        whyChat,
      });

      res
        .status(200)
        .json({ message: "user interest added successfully", updatedUser });
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  }

  async uploadProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      if (!token || !req.file) {
        res.status(400).json({ error: "Token and file are required" });
        return;
      }

      const userId = this.userService.verifyToken(token);
      if (!userId) {
        res.status(400).json({ error: "Invalid token" });
        return;
      }
      const filePath = req.file?.path;
      if (!filePath) {
        res.status(400).json({ error: "File path is missing" });
        return;
      }
      const updateUser = await this.userService.uploadProfilePicture(
        userId,
        filePath
      );
      res.status(200).json({
        message: "profile picture uploaded successfully",
        profilePhoto: updateUser.profilePhoto,
      });
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  }



  
  async postLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const { user, message } = await this.userService.authenticateUser(
        email,
        password
      );

     

      if (!user) {
       
        if (message === "No user is registered with this email") {
          res.status(404).json({ message });
          return;
        }

        if (message === "Invalid password") {
          res.status(401).json({message});
          return;
        }
        if(message ==="Your account is blocked"){
          res.status(403).json({message})
          return
        }

        res.status(400).json({ message: "Authentication failed" });
        return;
      }


    
      const role="user"
      const payload = { userId: user._id,role};
      const accessToken = JwtUtils.generateAccessToken(payload);
      const refreshToken = JwtUtils.generateRefreshToken(payload);

      res.cookie("userRefreshToken", refreshToken, {
        httpOnly: true,
        secure:process.env.NODE_ENV ==='production',
        sameSite:process.env.NODE_ENV ==='production'?'none':'lax',
        maxAge: 1 * 60 * 60 * 1000, 
      });

      res.status(200).json({
        message: "Login Successfull",
        accessToken,
        user,
        role
      });
    } catch (error) {
     
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(500).json({ error: errorMessage });
    }
  }

//user refresh token
  async refreshToken(req:Request,res:Response):Promise<void>{
    try {

       
        const refreshToken =req.cookies.userRefreshToken;
        console.log("Cookies:", req.cookies);
        
        if(!refreshToken){
            res.status(401).json({message:"Refresh token missing"});
            return;
        }

        const decoded =JwtUtils.verifyToken(refreshToken,true);
      

      
        if(!decoded){
            res.status(401).json({message:"Invalid Refresh token"});
            return;

        }
        
        const payload={userId:(decoded as {userId:string}).userId}


 
        const newAccessToken=JwtUtils.generateAccessToken(payload)
       
        console.log("new AccessToken refreshed:",newAccessToken)
    
        res.status(200).json({accessToken:newAccessToken})
    } catch (error) {
        console.error("Error in token refresh:",error);
        res.status(500).json({message:"An unexpected error occured"})


        
    }
}




  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      const response = await this.userService.sendForgotPasswordOtp(email);
      res.status(200).json(response);
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  }

  // Step 2: Verify OTP for password reset
  async verifyForgotPasswordOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        res.status(400).json({ error: "Email and OTP are required" });
        return;
      }

      const message = await this.userService.verifyForgotPassword(email, otp);
      res.status(200).json({ message });
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  }

  // Step 3: Reset password after OTP verification
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, newPassword, confirmPassword } = req.body;

      if (!email) {
        res.status(400).json({ error: "Email is required" });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(400).json({ error: "Passwords do not match" });
        return;
      }

      const user = await this.userService.resetPassword(email, newPassword);
      res.status(200).json({ message: "Password reset successfully", user });
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(400).json({ error: errorMessage });
    }
  }



  async getAllUsers(req:CustomRequest,res:Response):Promise<void>{
    try {

      const loggedInUser=req.user;
     
      if(!loggedInUser){
        res.status(401).json({message:"authentication failed"})
        return;
      }
      const allusers=await this.userService.getAllUsers();
      const users=allusers.filter(user=>user.id !==loggedInUser && user.isActive)
      res.status(200).json(users)
      
    } catch (error) {
      res.status(500).json({message:"fetch user details error"})
      
    }
  }



  async getUser(req:CustomRequest,res:Response):Promise<void>{
    try {
      const {id}=req.params;

      if(!id){
        res.status(400).json({message:"user id is required"})
        return;
      }

      const user=await this.userService.getUser(id)

      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }
      res.status(200).json(user);
      
    } catch (error) {
      res.status(500).json({ message: "Internal server error." });
    }
  }


  async getLoggedUser(req:CustomRequest,res:Response):Promise<void>{
    try {

      const userId=req.user
      if (!userId) {
        res.status(400).json({ message: "User ID is required" });
        return;
      }
  
      const user = await this.userService.getLoggedUser(userId);
  
      if (!user) {
        res.status(404).json({ message: "User not found." });
        return;
      }
  
      res.status(200).json(user);
      
    } catch (error) {
      res.status(500).json({ message: "Internal server error." });
    }
  }




  async updateUser(req:CustomRequest,res:Response):Promise<void>{

    try {
      const userId=req.user;
      
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }
      
      const updateData=req.body;

     

      const updatedUser=await this.userService.updateUser(userId,updateData)

      if (!updatedUser) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      res.status(200).json({ success: true, message: 'User updated successfully', data: updatedUser });

    } catch (error:any) {
      res.status(500).json({ success: false, message: error.message || 'An error occurred' });
    }
  }
}

export default UserController;
