import { Router } from "express";
import AdminController from "../../controllers/admin/adminController";
import AdminService from "../../services/implementation/admin/adminService";
import AdminRepository from "../../repositories/implementation/admin/adminRepository";
import adminAuthenticationMiddleware from "../../middlewares/adminAuthMiddleware";
import AdminBookingController from "../../controllers/admin/adminBookingController";


const adminRepository=new AdminRepository();
const adminService=new AdminService(adminRepository);
const adminController=new AdminController(adminService);

const adminBookingController=new AdminBookingController(adminService);

const router=Router()

//authentication routes

router.post('/',(req,res)=>adminController.postLogin(req,res))


router.post('/refresh-token',(req,res)=>adminController.refreshToken(req,res))

router.post('/logout', (req, res) => adminController.logoutAdmin(req, res));



// User Management
router.get('/users',adminAuthenticationMiddleware,(req,res)=>adminController.getAllUser(req,res))

router.patch('/users/:userId',adminAuthenticationMiddleware,(req,res)=>adminController.blockUnblockUser(req,res))

//Tutor Management

router.get('/tutors/alltutors',adminAuthenticationMiddleware,(req,res)=>adminController.getTutors(req,res))

router.get('/tutors/pending-tutors',adminAuthenticationMiddleware,(req,res)=>adminController.getPendingTutors(req,res))

router.patch('/tutors/verify/:tutorId/status',adminAuthenticationMiddleware,(req,res)=>adminController.tutorVerify(req,res))

router.patch('/tutors/:tutorId',adminAuthenticationMiddleware,(req,res)=>adminController.blockUnblockTutor(req,res))


//Booking Management

router.get('/bookings',adminAuthenticationMiddleware,(req,res)=>adminBookingController.getAllBookings(req,res));

router.get('/bookings/:bookingId',adminAuthenticationMiddleware,(req,res)=>adminBookingController.getBookingDetails(req,res));

export default router;