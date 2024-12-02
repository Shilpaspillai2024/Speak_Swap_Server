import { IUser } from "../../models/user/userModel";
import UserRepository from "../../repositories/user/userRepository";
import EmailUtils from "../../utils/emailUtils";
import PasswordUtils from "../../utils/passwordUtils";
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import cloudiary from '../../config/cloudinaryConfig'

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

  async sendOtp(token: string): Promise<{ email: string; otp: string; message: string }> {
    if (!token) {
      throw new Error("token is required to send otp");
    }



    const userId=this.verifyToken(token)

    const user=await this.userRepository.findUserById(userId);
    if(!user){
      throw new Error("User not found");
    }
    //generate 4 digit otp
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const otpExpiration = new Date();

    otpExpiration.setMinutes(otpExpiration.getMinutes()+10)  // otpexpired for 10 min

    


    user.otp =otp;
    user.otpExpiration = otpExpiration;
    await user.save();


    const response = await EmailUtils.sendOtp(user.email, otp);
    return {email:user.email,otp,message:"OTP sent successfully"}
  }



//verify otp

async verifyOtp(userId:string,otp:string):Promise<string>{
  const user =await this.userRepository.findUserById(userId)
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


async setPassword(userId:string,password:string):Promise<IUser>{
    const user=await this.userRepository.findUserById(userId);
    if(!user || !user.isVerified){
      throw new Error("User not found or not verified");
    }

   const hashedPassword=await PasswordUtils.hashPassword(password)
    user.password =hashedPassword;
    await user.save()
    return user;


}


// for step4 fetching countries continents languges from external api

  async updateProfileDetails(userId:string,details:Partial<IUser>):Promise<IUser>{
    const user= await this.userRepository.findUserById(userId)
    if(!user){
      throw new Error("User Not found")
    }

    Object.assign(user,details);
    await user.save()
    return user;
  }



  // step 5 for user prefernce

  async updateInterest(userId:string,details:Partial<IUser>):Promise<IUser>{
    const user =await this.userRepository.findUserById(userId)
     if(!user){
      throw new Error("User not found")
     }

     Object.assign(user,details);
     await user.save();


     return user;
  }


  //step 6 upload pictue

  async uploadProfilePicture(userId:string,filePath:string):Promise<IUser>{


    const user=await this.userRepository.findUserById(userId)
    if(!user){
      throw new Error("user not found")
    }

    

      const result=await cloudiary.uploader.upload(filePath,{
        folder:'profile_pictures',
        use_filename:true,
        unique_filename:false,
      });

      user.profilePhoto = result.secure_url;
      await user.save();
      return user;
      
    
  }

}

export default UserService;
