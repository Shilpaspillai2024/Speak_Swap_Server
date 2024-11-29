import { Router } from "express";
import UserController from "../../controllers/user/userController";
import UserService from "../../services/user/userService";
import UserRepositoryImplementation from "../../repositories/implementation/user/userRepositoryImplementation";

const router=Router()

const userRepository =new UserRepositoryImplementation();
const userService=new UserService(userRepository)
const userController=new UserController(userService)



router.post("/signup/basic_details",(req,res)=>userController.registerBasicDetails(req,res))
router.post("/signup/send_otp",(req,res)=>userController.sendOtp(req,res))
router.post("/signup/verify_otp",(req,res)=>userController.verifyOtp(req,res))

export default router;