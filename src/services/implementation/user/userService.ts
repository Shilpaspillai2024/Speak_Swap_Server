import { IUser } from "../../../models/user/userModel";
import IUserRepository from "../../../repositories/interfaces/user/iuserRepository";
import EmailUtils from "../../../utils/emailUtils";
import PasswordUtils from "../../../utils/passwordUtils";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cloudinary from "../../../config/cloudinaryConfig";
import ITutorRepository from "../../../repositories/interfaces/tutor/itutorRepository";
import { ITutor } from "../../../types/ITutor";
import { IUserService } from "../../interfaces/user/iuserService";
import fs from'fs/promises';

dotenv.config();

class UserService implements IUserService {
  
  private userRepository: IUserRepository;
  private tutorRepository: ITutorRepository;

  constructor(
    userRepository: IUserRepository,
    tutorRepository: ITutorRepository
  ) {
    this.userRepository = userRepository;

    this.tutorRepository = tutorRepository;
  }

  // Generate jwt

  private generateToken(userId: string): string {
    const token = jwt.sign({ userId }, process.env.JWT_TOKEN_SECRET!, {
      expiresIn: "1h",
    });

    return token;
  }

  public verifyToken(token: string): string {
    try {
      const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET!) as {
        userId: string;
      };
      return decoded.userId;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  //signup step1
  async registerBasicDetails(
    userDetails: Partial<IUser>
  ): Promise<{ user: IUser; token: string }> {
    const existingUser = await this.userRepository.findUserByEmail(
      userDetails.email!
    );
    if (existingUser) {
      throw new Error("email already Exists");
    }

  

    const user = await this.userRepository.create(userDetails);
    const token = this.generateToken(user._id.toString());

    return { user, token };
  }

  //send otp

  async sendOtp(
    token: string
  ): Promise<{ email: string; otp: string; message: string }> {
    if (!token) {
      throw new Error("token is required to send otp");
    }

    const userId = this.verifyToken(token);

  
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    //generate 4 digit otp
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiration = new Date();

    otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);

    user.otp = otp;
    user.otpExpiration = otpExpiration;
    await user.save();

    const response = await EmailUtils.sendOtp(user.email, otp);
    return { email: user.email, otp, message: "OTP sent successfully" };
  }

  //verify otp

  async verifyOtp(userId: string, otp: string): Promise<string> {
    
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    if (user.otp !== otp) {
      throw new Error("Ivalid Otp");
    }

    if (new Date() > user.otpExpiration!) {
      throw new Error("otp has expired");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiration = undefined;
    await user.save();

    return "Otp verified successfully";
  }

  async setPassword(userId: string, password: string): Promise<IUser> {
   
    const user = await this.userRepository.findById(userId);
    if (!user || !user.isVerified) {
      console.error("User not found or not verified");
      throw new Error("User not found or not verified");
    }

    const hashedPassword = await PasswordUtils.hashPassword(password);
    user.password = hashedPassword;
    await user.save();
    return user;
  }

  // for step4 fetching countries continents languges from external api

  async updateProfileDetails(
    userId: string,
    details: Partial<IUser>
  ): Promise<IUser> {
  
   const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User Not found");
    }

    Object.assign(user, details);
    await user.save();
    return user;
  }

  // step 5 for user prefernce

  async updateInterest(
    userId: string,
    details: Partial<IUser>
  ): Promise<IUser> {
   
   const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    Object.assign(user, details);
    await user.save();

    return user;
  }

  //step 6 upload pictue

  async uploadProfilePicture(userId: string, filePath: string): Promise<IUser> {
  
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("user not found");
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder: "profile_pictures",
      use_filename: true,
      unique_filename: false,
    });

    user.profilePhoto = result.secure_url;
    user.isActive = true;
    await user.save();


    await fs.unlink(filePath)
    .catch(error => {
      console.error('Error deleting local file:', error);
    });
    return user;
  }

  // user login

  async findUserByEmail(email: string): Promise<IUser | null> {
    const user = await this.userRepository.findUserByEmail(email);
    return user;
  }

  async authenticateUser(
    email: string,
    password: string
  ): Promise<{ user: IUser | null; message: string }> {
    const user = await this.userRepository.findUserByEmail(email);

    if (!user) {
      console.log("No user found with email");
      return { user: null, message: "No user is registered with this email" };
    }

    if (!user.isActive) {
      console.log("User account is blocked");
      return { user: null, message: "Your account is blocked" };
    }

    const comparePassword = await PasswordUtils.comparePassword(
      password,
      user.password
    );
    if (!comparePassword) {
      return { user: null, message: "Invalid Password" };
    }

           await this.userRepository.updateOnlineStatus(user._id.toString(),true)

    return { user: user, message: " User is Authenticated" };
  }

  //user forgot password

  async sendForgotPasswordOtp(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findUserByEmail(email);

    if (!user) {
      throw new Error("user not found");
    }

    //generate 4 digit otp
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiration = new Date();

    otpExpiration.setMinutes(otpExpiration.getMinutes() + 10);

    user.otp = otp;
    user.otpExpiration = otpExpiration;
    await user.save();

    const response = await EmailUtils.sendOtp(user.email, otp);
    return { message: "OTP sent successfully to email" };
  }

  //forgotpassword verify

  async verifyForgotPassword(email: string, otp: string): Promise<string> {
    const user = await this.userRepository.findUserByEmail(email);

    if (!user) {
      throw new Error("user not found");
    }

    if (user.otp !== otp) {
      throw new Error("Invalid otp");
    }

    if (new Date() > user.otpExpiration!) {
      throw new Error("otp has expired");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiration = undefined;
    await user.save();

    return "OTP verified successfully";
  }

  // forgot password reset

  async resetPassword(email: string, newPassword: string): Promise<IUser> {
    const user = await this.userRepository.findUserByEmail(email);

    if (!user) {
      throw new Error("User not found");
    }

    const hashedPassword = await PasswordUtils.hashPassword(newPassword);
    user.password = hashedPassword;
    await user.save();
    return user;
  }

  
  async getAllUsers(page: number=1, limit: number=6, loggedInUserId: string,searchQuery:string=""): Promise<IUser[]> {
    return await this.userRepository.getAllUsers(page,limit,loggedInUserId,searchQuery)
  }

  

  async getUser(id: string): Promise<IUser | null> {
  
    return await this.userRepository.findById(id);
  }

  async getLoggedUser(id: string): Promise<IUser | null> {
   
    return await this.userRepository.findById(id);
  }

  async updateUser(
    id: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    if (!id) {
      throw new Error("User id is required");
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new Error("No data provided for update");
    }

 
    return await this.userRepository.update(id, updateData);
  }

  // get All tutors for listing  user side

  async listTutorsForUser(searchQuery:string='',page:number=1,limit:number=9): Promise<{tutors:ITutor[],total:number}> {
    return await this.tutorRepository.searchTutors(searchQuery,page,limit)
  }

  // get each tutor for profile listing

  async tutorProfile(tutorId: string): Promise<ITutor | null> {
   
    return await this.tutorRepository.findById(tutorId);
  }


  async logoutUser(id: string): Promise<void> {
    await this.userRepository.updateOnlineStatus(id,false)
  }
}

export default UserService;
