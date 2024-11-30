import { Router } from "express";
import UserController from "../../controllers/user/userController";
import UserService from "../../services/user/userService";
import UserRepositoryImplementation from "../../repositories/implementation/user/userRepositoryImplementation";
import GeoController from "../../controllers/user/geoController";
import GeoService from "../../services/user/geoService";

const router=Router()

const userRepository =new UserRepositoryImplementation();
const userService=new UserService(userRepository)
const userController=new UserController(userService)
const geoService=new GeoService()
const geoController=new GeoController(geoService)


router.post("/signup/basic_details",(req,res)=>userController.registerBasicDetails(req,res))
router.post("/signup/send_otp",(req,res)=>userController.sendOtp(req,res))
router.post("/signup/verify_otp",(req,res)=>userController.verifyOtp(req,res))
router.post("/signup/setpassword",(req,res)=>userController.setpassword(req,res))


router.get("/countries",(req,res)=>geoController.getCountries(req,res))
router.get("/languages",(req,res)=>geoController.getLanguages(req,res))

export default router;