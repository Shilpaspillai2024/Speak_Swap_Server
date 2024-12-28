import { Admin, IAdmin } from "../../../models/admin/adminModel";
import AdminRepository from "../../admin/adminRepository";
import { IUser,User } from "../../../models/user/userModel";
import { ITutor } from "../../../types/ITutor";
import { Tutor } from "../../../models/tutor/tutorModel";

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


  async getTutors():Promise<ITutor[]>{
    const tutors=await Tutor.find()
    return tutors;
  }

  async getPendingTutors(): Promise<ITutor[]> {
    const pendingTutors=await Tutor.find({status:"pending"});
    return pendingTutors;
    
  }


  async tutorVerify(tutorId: string, status: string,isActive:boolean): Promise<ITutor | null> {
    const verifyTutor=await Tutor.findByIdAndUpdate(
      tutorId,
      {status:status,
        isActive:isActive
      },
      {new:true}
    );

    return verifyTutor;
  }


  async updateTutorStatus(tutorId: string, isActive: boolean): Promise<ITutor | null> {
    const updateTutor=await Tutor.findByIdAndUpdate(
      tutorId,
      {isActive},{
        new:true
      }
    );
    return updateTutor
  }

 
}

export default AdminRepositoryImplemenation;
