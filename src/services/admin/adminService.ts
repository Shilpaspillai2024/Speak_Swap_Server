import { IAdmin } from "../../models/admin/adminModel";
import AdminRepository from "../../repositories/admin/adminRepository";
import { IUser } from "../../models/user/userModel";
import { ITutor } from "../../types/ITutor";


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

        return await this.adminRepository.getAllUser();
    }

    async updateUserStatus(userId:string,isActive:boolean):Promise<IUser | null>{
        return await this.adminRepository.updateUserStatus(userId,isActive);
    }



    async getTutors():Promise<ITutor[]>{
        return await this.adminRepository.getTutors();

    }

    async getPendingTutors():Promise<ITutor[]>{
        return await this.adminRepository.getPendingTutors();

    }


    async tutorVerify(tutorId:string,status:string,isActive:boolean):Promise<ITutor | null>{
        return await this.adminRepository.tutorVerify(tutorId,status,isActive)
    }

    async updateTutorStatus(tutorId:string,isActive:boolean):Promise<ITutor | null>{
        return await this.adminRepository.updateTutorStatus(tutorId,isActive);
    }
}


export default AdminService