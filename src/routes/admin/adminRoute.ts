import { Router } from "express";
import AdminController from "../../controllers/admin/adminController";
import AdminService from "../../services/admin/adminService";
import AdminRepositoryImplemenation from "../../repositories/implementation/admin/adminRepositoryImplementation";
import adminAuthentcationMiddleware from "../../middlewares/adminAuthMiddleware";
import AdminBookingController from "../../controllers/admin/adminBookingController";


const adminRepositoryImplementation=new AdminRepositoryImplemenation();
const adminService=new AdminService(adminRepositoryImplementation);
const adminController=new AdminController(adminService);

const adminBookingController=new AdminBookingController(adminService);

const router=Router()

router.post('/',(req,res)=>adminController.postLogin(req,res))


router.post('/refresh-token',(req,res)=>adminController.refreshToken(req,res))

router.post('/logout', (req, res) => adminController.logoutAdmin(req, res));




router.get('/users',adminAuthentcationMiddleware,(req,res)=>adminController.getAllUser(req,res))

router.patch('/users/:userId',adminAuthentcationMiddleware,(req,res)=>adminController.blockUnblockUser(req,res))

router.get('/tutors/alltutors',adminAuthentcationMiddleware,(req,res)=>adminController.getTutors(req,res))

router.get('/tutors/pending-tutors',adminAuthentcationMiddleware,(req,res)=>adminController.getPendingTutors(req,res))

router.patch('/tutors/verify/:tutorId/status',adminAuthentcationMiddleware,(req,res)=>adminController.tutorVerify(req,res))

router.patch('/tutors/:tutorId',adminAuthentcationMiddleware,(req,res)=>adminController.blockUnblockTutor(req,res))



router.get('/bookings',adminAuthentcationMiddleware,(req,res)=>adminBookingController.getAllBookings(req,res));

router.get('/bookings/:bookingId',adminAuthentcationMiddleware,(req,res)=>adminBookingController.getBookingDetails(req,res));

export default router;