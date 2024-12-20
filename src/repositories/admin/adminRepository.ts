import { IAdmin } from "../../models/admin/adminModel";
import { IUser } from "../../models/user/userModel";

interface AdminRepository{
    findByEmail(email:string):Promise<IAdmin|null>
    getAllUser():Promise<IUser[]>
    updateUserStatus(userId:string,isActive:boolean):Promise<IUser | null>
   

}

export default AdminRepository