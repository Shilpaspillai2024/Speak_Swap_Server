import { IUser } from "../../models/user/userModel";
import UserRepository from "../../repositories/user/userRepository";
import EmailUtils from "../../utils/emailUtils";
import PasswordUtils from "../../utils/passwordUtils";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }



  // Generate jwt

  private generateToken(userId:string):string{
    const token =jwt.sign({userId},process.env.JWT_TOKEN_SECRET!,{
      expiresIn:"1h",
    });

    return token;
  }


  public verifyToken(token:string):string{
    try {
      const decoded =jwt.verify(token,process.env.JWT_TOKEN_SECRET!) as {userId:string}
       return decoded.userId;
    } catch (error) {
      throw new Error("Invalid or expired token")
    }
  }

  //signup step1
  async registerBasicDetails(userDetails: Partial<IUser>): Promise<{user:IUser,token:string}> {
    const existingUser = await this.userRepository.findUserByEmail(
      userDetails.email!
    );
    if (existingUser) {
      throw new Error("email already Exists");
    }

    const user = await this.userRepository.createUser(userDetails);
    const token=this.generateToken(user._id.toString())
    
    return {user,token}
  }

  //send otp

  async sendOtp(email: string): Promise<{ email: string; otp: string; message: string }> {
    if (!email) {
      throw new Error("Email is required to send otp");
    }


    //generate 4 digit otp
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiration = new Date();

    otpExpiration.setMinutes(otpExpiration.getMinutes()+10)  // otpexpired for 10 min

    const user=await this.userRepository.findUserByEmail(email);
    if(!user){
      throw new Error("User not found");
    }


    user.otp =otp;
    user.otpExpiration = otpExpiration;
    await user.save();


    const response = await EmailUtils.sendOtp(email, otp);
    return {email,otp,message:"OTP sent successfully"}
  }



//verify otp

async verifyOtp(email:string,otp:string):Promise<string>{
  const user =await this.userRepository.findUserByEmail(email)
  if(!user){
    throw new Error("User not found");
  }


  if(user.otp !== otp){
    throw new Error("Ivalid Otp")
  }

  if(new Date()> user.otpExpiration!){
    throw new Error("otp has expired")
  }

  user.isVerified =true;
  user.otp =undefined;
  user.otpExpiration=undefined;
  await user.save()

  return "Otp verified successfully"
}


async setPassword(email:string,password:string):Promise<IUser>{
    const user=await this.userRepository.findUserByEmail(email);
    if(!user || !user.isVerified){
      throw new Error("User not found or not verified");
    }

   const hashedPassword=await PasswordUtils.hashPassword(password)
    user.password =hashedPassword;
    await user.save()
    return user;


}


// for step4 fetching countries continents languges from external api

  async updateProfileDetails(email:string,details:Partial<IUser>):Promise<IUser>{
    const user= await this.userRepository.findUserByEmail(email)
    if(!user){
      throw new Error("User Not found")
    }

    Object.assign(user,details);
    await user.save()
    return user;
  }



}

export default UserService;
