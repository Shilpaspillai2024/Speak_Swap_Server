import { IUser } from "../../models/user/userModel";
import UserRepository from "../../repositories/user/userRepository";
import EmailUtils from "../../utils/emailUtils";

class UserService {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }


  //signup step1
  async registerBasicDetails(userDetails: Partial<IUser>): Promise<IUser> {
    const existingUser = await this.userRepository.findUserByEmail(
      userDetails.email!
    );
    if (existingUser) {
      throw new Error("email already Exists");
    }

    const user = await this.userRepository.createUser(userDetails);
    return user;
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


  user.otp =undefined;
  user.otpExpiration=undefined;
  await user.save()

  return "Otp verified successfully"
}




}

export default UserService;
