import { Router } from "express";
import BookingController from "../../controllers/booking/bookingController";
import BookingRepositoryImplementation from "../../repositories/implementation/booking/bookingRepositoryImplentation";
import BookingService from "../../services/booking/bookingService";
import authMiddleware from "../../middlewares/authMiddleware";

const router=Router();

const bookingRepository =new BookingRepositoryImplementation();
const bookingService=new BookingService(bookingRepository);
const bookingController=new BookingController(bookingService);

router.post("/create",authMiddleware, (req, res) => bookingController.createBooking(req,res));
router.post("/verify-payment",authMiddleware,(req,res)=>bookingController.verifyPayment(req,res))


router.get('/:bookingId',authMiddleware,(req,res)=>bookingController.getBookingDetails(req,res))

router.get('/booked-slots/:tutorId/:selectedDay',authMiddleware,(req,res)=>bookingController.getBookedSlots(req,res));

export default router;