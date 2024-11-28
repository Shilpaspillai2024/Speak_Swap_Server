import { IAdmin } from "../../models/admin/adminModel";

interface AdminRepository{
    findByEmail(email:string):Promise<IAdmin|null>
}

export default AdminRepository