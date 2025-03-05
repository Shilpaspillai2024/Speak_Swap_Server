import { IUser } from "../../../models/user/userModel";
import { ITutor } from "../../../types/ITutor";

export interface IUserService {
  registerBasicDetails(userDetails: Partial<IUser>): Promise<{ user: IUser; token: string }>;

  sendOtp(token: string): Promise<{ email: string; otp: string; message: string }>;

  verifyOtp(userId: string, otp: string): Promise<string>;

  setPassword(userId: string, password: string): Promise<IUser>;

  updateProfileDetails(userId: string, details: Partial<IUser>): Promise<IUser>;

  updateInterest(userId: string, details: Partial<IUser>): Promise<IUser>;

  uploadProfilePicture(userId: string, filePath: string): Promise<IUser>;

  findUserByEmail(email: string): Promise<IUser | null>;

  authenticateUser(email: string, password: string): Promise<{ user: IUser | null; message: string }>;

  sendForgotPasswordOtp(email: string): Promise<{ message: string }>;

  verifyForgotPassword(email: string, otp: string): Promise<string>;

  resetPassword(email: string, newPassword: string): Promise<IUser>;

  getAllUsers(page:number,limit:number,loggedInUserId:string,searchQuery:string): Promise<IUser[]>;


  getUser(id: string): Promise<IUser | null>;

  getLoggedUser(id: string): Promise<IUser | null>;

  updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null>;

  listTutorsForUser(searchQuery:string,page:number,limit:number): Promise<{tutors:ITutor[],total:number}>;

  tutorProfile(tutorId: string): Promise<ITutor | null>;

  verifyToken(token: string): string;


  logoutUser(id:string):Promise<void>
}
