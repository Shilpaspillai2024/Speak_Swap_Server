import { User,IUser } from "../../../models/user/userModel";
import IUserRepository from "../../interfaces/user/iuserRepository";

class UserRepository implements IUserRepository{


    async createUser(user: Partial<IUser>): Promise<IUser> {
      const newUser=new User(user);
      return await newUser.save()
    }

    async findUserByEmail(email: string): Promise<IUser | null> {
       
        return await User.findOne({email})
    }

    async findUserById(id: string): Promise<IUser | null> {
        return await User.findById(id)
    }

    async updateOnlineStatus(id: string, isOnline: boolean): Promise<void> {
        await User.findByIdAndUpdate(id,{
            isOnline,
            lastActive: new Date()
        })
    }


    async updateUser(id: string, update: Partial<IUser>): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id,update,{new:true})
    }

    async getAllUsers(): Promise<IUser[]> {
        return await User.find()
    }

    async deleteUser(id: string): Promise<IUser | null> {
        return await User.findByIdAndDelete(id)
    }

}


export default UserRepository;