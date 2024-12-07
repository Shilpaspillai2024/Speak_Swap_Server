import { Router } from "express";
import TutorController from "../../controllers/tutor/tutorController";
import TutorService from "../../services/tutor/tutorService";
import TutorRepositoryImplemenation from "../../repositories/implementation/tutor/tutorRepositoryImplementation";
import tutorUpload from "../../middlewares/tutorUploadMiddleware";

const router=Router()

const tutorRepository=new TutorRepositoryImplemenation()
const tutorService=new TutorService(tutorRepository)
const tutorController=new TutorController(tutorService)


router.post("/signup",(req,res)=>tutorController.tutorBasicDetails(req,res))
router.post("/signup/send_otp",(req,res)=>tutorController.sendOtp(req,res))
router.post("/signup/verify_otp",(req,res)=>tutorController.verifyOtp(req,res))
router.post("/signup/setpassword",(req,res)=>tutorController.setpassword(req,res))


router.post("/signup/profile",tutorUpload.fields([{name:"profilePhoto",maxCount:1},
    {name:"certificates",maxCount:5},
    {name:"introductionVideo",maxCount:1}
]),(req,res)=>tutorController.tutorProfile(req,res))
export default router
