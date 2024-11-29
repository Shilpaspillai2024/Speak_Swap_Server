import { User,IUser } from "../../../models/user/userModel";
import UserRepository from "../../user/userRepository";


class UserRepositoryImplementation implements UserRepository{


    async createUser(user: Partial<IUser>): Promise<IUser> {
      const newUser=new User(user);
      return await newUser.save()
    }

    async findUserByEmail(email: string): Promise<IUser | null> {
       
        return await User.findOne({email})
    }


    async updateUser(id: string, update: Partial<IUser>): Promise<IUser | null> {
        return await User.findByIdAndUpdate(id,update,{new:true})
    }

}


export default UserRepositoryImplementation