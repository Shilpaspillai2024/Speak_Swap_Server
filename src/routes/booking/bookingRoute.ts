import { Router } from "express";
import BookingController from "../../controllers/booking/bookingController";
import BookingRepositoryImplementation from "../../repositories/implementation/booking/bookingRepositoryImplentation";
import BookingService from "../../services/booking/bookingService";
import authMiddleware from "../../middlewares/authMiddleware";
import WalletService from "../../services/wallet/walletService";
import WalletRepositoryImplementation from "../../repositories/implementation/wallet/walletRepositoryImplementation";

const router=Router();

const bookingRepository =new BookingRepositoryImplementation();

const walletRepository = new WalletRepositoryImplementation();


const walletService = new WalletService(walletRepository);

const bookingService=new BookingService(bookingRepository,walletService);



const bookingController=new BookingController(bookingService);

router.post("/create",authMiddleware, (req, res) => bookingController.createBooking(req,res));
router.post("/verify-payment",authMiddleware,(req,res)=>bookingController.verifyPayment(req,res))


router.get('/:bookingId',authMiddleware,(req,res)=>bookingController.getBookingDetails(req,res))

router.get('/booked-slots/:tutorId/:selectedDay',authMiddleware,(req,res)=>bookingController.getBookedSlots(req,res));


router.get('/user/bookings',authMiddleware,(req,res)=>bookingController.getUserBookings(req,res))


router.get('/tutor/bookings',authMiddleware,(req,res)=>bookingController.getTutorBookings(req,res))
export default router;