import { Router } from "express";
import UserController from "../../controllers/user/userController";
import UserService from "../../services/user/userService";
import UserRepositoryImplementation from "../../repositories/implementation/user/userRepositoryImplementation";
import GeoController from "../../controllers/user/geoController";
import GeoService from "../../services/user/geoService";
import upload from "../../middlewares/uploadMiddleware";
import authenticationMiddleware from "../../middlewares/authenticationMiddleware";

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
router.post("/signup/updateprofile",(req,res)=>userController.updateProfileDetails(req,res))
router.post("/signup/interest",(req,res)=>userController.updateInterest(req,res))
router.post("/signup/upload_profile_picture",upload.single("profilePhoto"),(req,res)=>userController.uploadProfilePicture(req,res))
router.post("/login",(req,res)=>userController.postLogin(req,res))

router.post("/forgot-password",(req,res)=>userController.forgotPassword(req,res))
router.post("/verify-otp",(req,res)=>userController.verifyForgotPasswordOtp(req,res))
router.post("/reset-password",(req,res)=>userController.resetPassword(req,res))

router.get("/countries",(req,res)=>geoController.getCountries(req,res))
router.get("/languages",(req,res)=>geoController.getLanguages(req,res))


router.get("/users",authenticationMiddleware,(req,res)=>userController.getAllUsers(req,res))
export default router;