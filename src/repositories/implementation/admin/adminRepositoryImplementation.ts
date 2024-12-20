import { Admin, IAdmin } from "../../../models/admin/adminModel";
import AdminRepository from "../../admin/adminRepository";
import { IUser,User } from "../../../models/user/userModel";

class AdminRepositoryImplemenation implements AdminRepository {
  async findByEmail(email: string): Promise<IAdmin | null> {
    const admin = await Admin.findOne({ email });

    return admin;
  }
  async getAllUser(): Promise<IUser[]> {
    const users=await User.find()
    return users
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<IUser | null> {
    const updateUser=await User.findByIdAndUpdate(
      userId,
      {isActive},
      {
        new:true
      }
    );
    return updateUser
  }


 
}

export default AdminRepositoryImplemenation;
