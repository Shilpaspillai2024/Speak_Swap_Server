import { Admin, IAdmin } from "../../../models/admin/adminModel";
import AdminRepository from "../../admin/adminRepository";

class AdminRepositoryImplemenation implements AdminRepository {
  async findByEmail(email: string): Promise<IAdmin | null> {
    const admin = await Admin.findOne({ email });

    return admin;
  }
}

export default AdminRepositoryImplemenation;
