import { Router } from "express";
import AdminController from "../../controllers/admin/adminController";
import AdminService from "../../services/admin/adminService";
import AdminRepositoryImplemenation from "../../repositories/implementation/admin/adminRepositoryImplementation";
import adminAuthentcationMiddleware from "../../middlewares/adminAuthMiddleware";

const adminRepositoryImplementation=new AdminRepositoryImplemenation();
const adminService=new AdminService(adminRepositoryImplementation)
const adminController=new AdminController(adminService)


const router=Router()

router.post('/',(req,res)=>adminController.postLogin(req,res))
router.post('/refresh-token',(req,res)=>adminController.refreshToken(req,res))

router.get('/users',adminAuthentcationMiddleware,(req,res)=>adminController.getAllUser(req,res))

router.patch('/users/:userId',adminAuthentcationMiddleware,(req,res)=>adminController.blockUnblockUser(req,res))

export default router;