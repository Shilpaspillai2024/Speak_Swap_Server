import { Router } from "express";
import AdminController from "../../controllers/admin/adminController";
import AdminService from "../../services/admin/adminService";
import AdminRepositoryImplemenation from "../../repositories/implementation/admin/adminRepositoryImplementation";


const adminRepositoryImplementation=new AdminRepositoryImplemenation();
const adminService=new AdminService(adminRepositoryImplementation)
const adminController=new AdminController(adminService)


const router=Router()

router.post('/',(req,res)=>adminController.postLogin(req,res))

export default router;