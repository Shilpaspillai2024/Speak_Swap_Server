import { IAdmin } from "../../models/admin/adminModel";
import AdminRepository from "../../repositories/admin/adminRepository";
import { IUser } from "../../models/user/userModel";


class AdminService{

    private adminRepository:AdminRepository;

    constructor(adminRepository:AdminRepository){
        this.adminRepository=adminRepository
    }



    async findByEmail(email:string):Promise<IAdmin | null>{
        const admin=await this.adminRepository.findByEmail(email);
        return admin
    }


    async getAllUser():Promise<IUser[]>{

        return await this.adminRepository.getAllUser()
    }

    async updateUserStatus(userId:string,isActive:boolean):Promise<IUser | null>{
        return await this.adminRepository.updateUserStatus(userId,isActive)
    }
}


export default AdminService