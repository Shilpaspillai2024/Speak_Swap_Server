import { IAdmin } from "../../models/admin/adminModel";
import { IUser } from "../../models/user/userModel";
import { ITutor } from "../../types/ITutor";

interface AdminRepository{
    findByEmail(email:string):Promise<IAdmin|null>
    getAllUser():Promise<IUser[]>
    updateUserStatus(userId:string,isActive:boolean):Promise<IUser | null>
    getTutors():Promise<ITutor[]>;
    getPendingTutors():Promise<ITutor[]>;
    tutorVerify(tutorId:string,status:string,isActive:boolean):Promise<ITutor | null>
    updateTutorStatus(tutorId:string,isActive:boolean):Promise<ITutor | null>
   

}

export default AdminRepository