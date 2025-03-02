import { Request, Response } from "express";
import JwtUtils from "../../utils/jwtUtils";
import { CustomRequest } from "../../middlewares/authMiddleware";
import { IUserService } from "../../services/interfaces/user/iuserService";
import { HttpStatus } from "../../constants/httpStatus";

class UserController {
  private userService: IUserService;

  constructor(userService: IUserService) {
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
      res.status(HttpStatus.BAD_REQUEST).json({ error: errorMessage });
    }
  }

  async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      if (!token) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Token is requied" });
        return;
      }
      const response = await this.userService.sendOtp(token);
      res.status(HttpStatus.OK).json(response);
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
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Token and OTP are required" });
        return;
      }

      const userId = this.userService.verifyToken(token);
      const message = await this.userService.verifyOtp(userId, otp);

      res.status(HttpStatus.OK).json({ message });
    } catch (error) {
      let errorMessage = "an unexpected error occured";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(HttpStatus.BAD_REQUEST).json({ error: errorMessage });
    }
  }

  async setpassword(req: Request, res: Response): Promise<void> {
    try {
      const { token, password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Password do not match" });
        return;
      }

      const userId = this.userService.verifyToken(token);

      if (!userId) {
        console.error("Invalid or expired token");
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Invalid or expired token" });
        return;
      }

      const result = await this.userService.setPassword(userId, password);
      res.status(HttpStatus.OK).json({ message: "Password Set Successfully", result });
    } catch (error) {
      let errorMessage = "an unexpected error occured";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(HttpStatus.BAD_REQUEST).json({ error: errorMessage });
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
        res.status(HttpStatus.BAD_REQUEST).json({ error: "All fields are required" });
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
        .status(HttpStatus.OK)
        .json({ message: "Profile updated successfully", updatedUser });
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(HttpStatus.BAD_REQUEST).json({ error: errorMessage });
    }
  }

  async updateInterest(req: Request, res: Response): Promise<void> {
    try {
      const { token, talkAbout, learningGoal, whyChat } = req.body;

      if (!token || !talkAbout || !learningGoal || !whyChat) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "All fields are required" });
        return;
      }

      const userId = this.userService.verifyToken(token);
      const updatedUser = await this.userService.updateInterest(userId, {
        talkAbout,
        learningGoal,
        whyChat,
      });

      res
        .status(HttpStatus.OK)
        .json({ message: "user interest added successfully", updatedUser });
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(HttpStatus.BAD_REQUEST).json({ error: errorMessage });
    }
  }

  async uploadProfilePicture(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      if (!token || !req.file) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Token and file are required" });
        return;
      }

      const userId = this.userService.verifyToken(token);
      if (!userId) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Invalid token" });
        return;
      }
      const filePath = req.file?.path;
      if (!filePath) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "File path is missing" });
        return;
      }
      const updateUser = await this.userService.uploadProfilePicture(
        userId,
        filePath
      );
      res.status(HttpStatus.OK).json({
        message: "profile picture uploaded successfully",
        profilePhoto: updateUser.profilePhoto,
      });
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(HttpStatus.BAD_REQUEST).json({ error: errorMessage });
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
          res.status(HttpStatus.NOT_FOUND).json({ message });
          return;
        }

        if (message === "Invalid password") {
          res.status(HttpStatus.UNAUTHORIZED).json({message});
          return;
        }
        if(message ==="Your account is blocked"){
          res.status(HttpStatus.FORBIDDEN).json({message})
          return
        }

        res.status(HttpStatus.BAD_REQUEST).json({ message: "Authentication failed" });
        return;
      }


    
    
      const payload = { userId: user._id,role:user.role};
      const accessToken = JwtUtils.generateAccessToken(payload);
      const refreshToken = JwtUtils.generateRefreshToken(payload);

      res.cookie("userRefreshToken", refreshToken, {
        httpOnly: true,
        secure:process.env.NODE_ENV ==='production',
        sameSite:process.env.NODE_ENV ==='production'?'none':'lax',
        maxAge: 1 * 60 * 60 * 1000, 
      });

      res.status(HttpStatus.OK).json({
        message: "Login Successfull",
        accessToken,
        user,
        
      });
    } catch (error) {
     
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: errorMessage });
    }
  }

//user refresh token
  async refreshToken(req:Request,res:Response):Promise<void>{
    try {

       
        const refreshToken =req.cookies.userRefreshToken;
        console.log("Cookies:", req.cookies);
        
        if(!refreshToken){
            res.status(HttpStatus.UNAUTHORIZED).json({message:"Refresh token missing"});
            return;
        }

        const decoded =JwtUtils.verifyToken(refreshToken,true);
      

      
        if(!decoded){
            res.status(HttpStatus.UNAUTHORIZED).json({message:"Invalid Refresh token"});
            return;

        }
        
        const payload={
          userId:(decoded as {userId:string}).userId,
          role: (decoded as { role: string }).role,
        }


 
        const newAccessToken=JwtUtils.generateAccessToken(payload)
       
        console.log("new AccessToken refreshed:",newAccessToken)
    
        res.status(HttpStatus.OK).json({accessToken:newAccessToken})
    } catch (error) {
        console.error("Error in token refresh:",error);
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message:"An unexpected error occured"})


        
    }
}




  async forgotPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      if (!email) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Email is required" });
        return;
      }

      const response = await this.userService.sendForgotPasswordOtp(email);
      res.status(HttpStatus.OK).json(response);
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(HttpStatus.BAD_REQUEST).json({ error: errorMessage });
    }
  }

  // Step 2: Verify OTP for password reset
  async verifyForgotPasswordOtp(req: Request, res: Response): Promise<void> {
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Email and OTP are required" });
        return;
      }

      const message = await this.userService.verifyForgotPassword(email, otp);
      res.status(HttpStatus.OK).json({ message });
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(HttpStatus.BAD_REQUEST).json({ error: errorMessage });
    }
  }

  // Step 3: Reset password after OTP verification
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, newPassword, confirmPassword } = req.body;

      if (!email) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Email is required" });
        return;
      }

      if (newPassword !== confirmPassword) {
        res.status(HttpStatus.BAD_REQUEST).json({ error: "Passwords do not match" });
        return;
      }

      const user = await this.userService.resetPassword(email, newPassword);
      res.status(HttpStatus.OK).json({ message: "Password reset successfully", user });
    } catch (error) {
      let errorMessage = "An unexpected error occurred";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      res.status(HttpStatus.BAD_REQUEST).json({ error: errorMessage });
    }
  }



  async getAllUsers(req:CustomRequest,res:Response):Promise<void>{
    try {

      const loggedInUser=req.user;
     
      if(!loggedInUser){
        res.status(HttpStatus.UNAUTHORIZED).json({message:"authentication failed"})
        return;
      }

      const page=parseInt(req.query.page as string) || 1;
      const limit=parseInt(req.query.limit as string) || 6;

     

      const searchQuery=(req.query.search as string) || "";


      const users=await this.userService.getAllUsers(
        page,
        limit,
        loggedInUser,
        searchQuery
      )
      res.status(HttpStatus.OK).json(users)
      
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({message:"fetch user details error"})
      
    }
  }



  async getUser(req:CustomRequest,res:Response):Promise<void>{
    try {
      const {id}=req.params;

      if(!id){
        res.status(HttpStatus.BAD_REQUEST).json({message:"user id is required"})
        return;
      }

      const user=await this.userService.getUser(id)

      if (!user) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "User not found." });
        return;
      }
      res.status(HttpStatus.OK).json(user);
      
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
  }


  async getLoggedUser(req:CustomRequest,res:Response):Promise<void>{
    try {

      const userId=req.user
      if (!userId) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: "User ID is required" });
        return;
      }
  
      const user = await this.userService.getLoggedUser(userId);
  
      if (!user) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "User not found." });
        return;
      }
  
      res.status(HttpStatus.OK).json(user);
      
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error." });
    }
  }




  async updateUser(req:CustomRequest,res:Response):Promise<void>{

    try {
      const userId=req.user;
      
      if (!userId) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'User ID is required' });
        return;
      }
      
      const updateData=req.body;

     

      const updatedUser=await this.userService.updateUser(userId,updateData)

      if (!updatedUser) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'User not found' });
        return;
      }

      res.status(HttpStatus.OK).json({ success: true, message: 'User updated successfully', data: updatedUser });

    } catch (error:any) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message || 'An error occurred' });
    }
  }




  // get All tutors in user side

   async listTutorsForUser(req:CustomRequest,res:Response):Promise<void>{
      
    try {

      const searchQuery=req.query.search as string || '';
      const page=parseInt(req.query.page as string) || 1;

      const limit=parseInt(req.query.limit as string) || 9;
      const result=await this.userService.listTutorsForUser(searchQuery,page,limit);

      console.log("fetched tutors:",result)
     
      


      res.status(HttpStatus.OK).json({
        tutors:result.tutors,
      
        meta: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: result.total,
          totalPages: Math.ceil(result.total / limit)
        }
      
      })
    } catch (error:any) {
 
      console.error('Error fetching tutors:', error); 
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch tutors', error: error.message });
    }
    }


    // get tutor profile
     async tutorProfile(req:CustomRequest,res:Response): Promise<void> {
      try {

        const {tutorId}=req.params;

      if(!tutorId){
        res.status(HttpStatus.BAD_REQUEST).json({message:"tutor id is required"})
        return;
      }

      const tutor=await this.userService.tutorProfile(tutorId)

      if (!tutor) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "tutor not found." });
        return;
      }
      res.status(HttpStatus.OK).json(tutor);
        
        
      } catch (error:any) {
        console.error('Error fetching tutor:', error); 
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch tutor', error: error.message });
      }
      }



       async logoutUser(req:CustomRequest, res: Response): Promise<void> {
          try {

            const id=req.user
            if(!id){
              res.status(HttpStatus.BAD_REQUEST).json({message:"user id is required"})
              return;
            }

            await this.userService.logoutUser(id.toString())

           
            res.clearCookie("userRefreshToken", {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
              path: "/",
            });
      
            res.status(HttpStatus.OK).json({ message: "Logout successful" });
          } catch (error) {
            console.error("Error in logout:", error);
            res
              .status(HttpStatus.INTERNAL_SERVER_ERROR)
              .json({ message: "An unexpected error occurred during logout" });
          }
        }
      

}

export default UserController;
