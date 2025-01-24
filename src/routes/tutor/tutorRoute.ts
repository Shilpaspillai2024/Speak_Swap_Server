import { Router } from "express";
import TutorController from "../../controllers/tutor/tutorController";
import TutorService from "../../services/tutor/tutorService";
import TutorRepositoryImplemenation from "../../repositories/implementation/tutor/tutorRepositoryImplementation";
import tutorUpload from "../../middlewares/tutorUploadMiddleware";
import authMiddleware from "../../middlewares/authMiddleware";

import WalletService from "../../services/wallet/walletService";
import WalletRepositoryImplementation from "../../repositories/implementation/wallet/walletRepositoryImplementation";
import WalletController from "../../controllers/wallet/walletController";


const router=Router()

const tutorRepository=new TutorRepositoryImplemenation()
const tutorService=new TutorService(tutorRepository)
const tutorController=new TutorController(tutorService)


const walletRepository = new WalletRepositoryImplementation();
const walletService = new WalletService(walletRepository);
const walletController = new WalletController(walletService);



router.post("/signup",(req,res)=>tutorController.tutorBasicDetails(req,res))
router.post("/signup/send_otp",(req,res)=>tutorController.sendOtp(req,res))
router.post("/signup/verify_otp",(req,res)=>tutorController.verifyOtp(req,res))
router.post("/signup/setpassword",(req,res)=>tutorController.setpassword(req,res))


router.post("/signup/profile",tutorUpload.fields([{name:"profilePhoto",maxCount:1},
    {name:"certificates",maxCount:5},
    {name:"introductionVideo",maxCount:1}
]),(req,res)=>tutorController.tutorProfile(req,res))

router.post("/forgot-password",(req,res)=>tutorController.forgotPassword(req,res))
router.post("/verify-otp",(req,res)=>tutorController.verifyForgotPasswordOtp(req,res))
router.post("/reset-password",(req,res)=>tutorController.resetPassword(req,res))


router.post("/login",(req,res)=>tutorController.tutorLogin(req,res))

router.post('/refresh-token',(req,res)=>tutorController.refreshToken(req,res))

router.get('/profile',authMiddleware,(req,res)=>tutorController.getTutor(req,res))


router.put('/:tutorId/availability',authMiddleware,(req,res)=>tutorController.setAvailability(req,res))



router.delete('/:tutorId/availability/:day/:slotIndex',(req,res)=>tutorController.deleteSlot(req,res))

router.get('/:tutorId/availability',authMiddleware,(req,res)=>tutorController.getAvailability(req,res))


router.get('/wallet-details', authMiddleware, (req, res) => 
    walletController.getWalletDetails(req, res)
  );
export default router
