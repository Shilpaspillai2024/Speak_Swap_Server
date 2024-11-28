import { IAdmin } from "../../models/admin/adminModel";
import AdminRepository from "../../repositories/admin/adminRepository";

class AdminService{

    private adminRepository:AdminRepository;

    constructor(adminRepository:AdminRepository){
        this.adminRepository=adminRepository
    }



    async findByEmail(email:string):Promise<IAdmin | null>{
        const admin=await this.adminRepository.findByEmail(email);
        return admin
    }
}


export default AdminService