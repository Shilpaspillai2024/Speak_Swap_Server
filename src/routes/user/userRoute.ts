import { Router } from "express";
import UserController from "../../controllers/user/userController";
import UserService from "../../services/implementation/user/userService";
import UserRepository from "../../repositories/implementation/user/userRepository";
import upload from "../../middlewares/uploadMiddleware";
import authMiddleware from "../../middlewares/authMiddleware";
import TutorRepository from "../../repositories/implementation/tutor/tutorRepository";

import WalletService from "../../services/implementation/wallet/walletService";
import WalletRepository from "../../repositories/implementation/wallet/walletRepository";
import UserWalletRepository from "../../repositories/implementation/wallet/userWalletRepository";
import WalletController from "../../controllers/wallet/walletController";



const router=Router()

const userRepository =new UserRepository();

const tutorRepository=new TutorRepository();
const userService=new UserService(userRepository,tutorRepository)
const userController=new UserController(userService)



const walletRepository = new WalletRepository();
const userWalletRepository=new UserWalletRepository();

const walletService = new WalletService(walletRepository,userWalletRepository);
const walletController = new WalletController(walletService);



router.post("/signup/basic_details",(req,res)=>userController.registerBasicDetails(req,res))
router.post("/signup/send_otp",(req,res)=>userController.sendOtp(req,res))
router.post("/signup/verify_otp",(req,res)=>userController.verifyOtp(req,res))
router.post("/signup/setpassword",(req,res)=>userController.setpassword(req,res))
router.post("/signup/updateprofile",(req,res)=>userController.updateProfileDetails(req,res))
router.post("/signup/interest",(req,res)=>userController.updateInterest(req,res))
router.post("/signup/upload_profile_picture",upload.single("profilePhoto"),(req,res)=>userController.uploadProfilePicture(req,res))


router.post("/forgot-password",(req,res)=>userController.forgotPassword(req,res))
router.post("/verify-otp",(req,res)=>userController.verifyForgotPasswordOtp(req,res))
router.post("/reset-password",(req,res)=>userController.resetPassword(req,res))

router.post("/login",(req,res)=>userController.postLogin(req,res))

router.post('/refresh-token',(req,res)=>userController.refreshToken(req,res))




router.get("/users",authMiddleware,(req,res)=>userController.getAllUsers(req,res))


router.get("/user/:id",authMiddleware,(req,res)=>userController.getUser(req,res))

router.get("/profile",authMiddleware,(req,res)=>userController.getLoggedUser(req,res))

router.put('/update',authMiddleware,(req,res)=>userController.updateUser(req,res))


router.get("/tutors",authMiddleware,(req,res)=>userController.listTutorsForUser(req,res))

router.get("/tutors/:tutorId",authMiddleware,(req,res)=>userController.tutorProfile(req,res))


router.get(`/wallet`,authMiddleware,(req,res)=>walletController.getUserWalletDetails(req,res))

router.get(`/userwallet`,authMiddleware,(req,res)=>walletController.getUserWallet(req,res))

router.post(`/logout`,authMiddleware,(req,res)=>userController.logoutUser(req,res))

export default router;