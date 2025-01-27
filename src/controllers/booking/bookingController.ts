import { Response } from "express";
import { CustomRequest } from "../../middlewares/authMiddleware";
import Booking from "../../models/booking/bookingModel";
import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";
import IBookingService from "../../services/interfaces/booking/ibookingService";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  throw new Error("Razorpay key ID or key secret is not defined.");
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

class BookingController {
  private bookingService: IBookingService;
  

  constructor(bookingService: IBookingService) {
    this.bookingService = bookingService;
   
  }

  async createBooking(req: CustomRequest, res: Response): Promise<void> {
    try {
      const userId = req.user;

      const { tutorId, selectedDay, selectedSlot, sessionFee } = req.body;

      if (!userId || !tutorId || !selectedDay || !selectedSlot || !sessionFee) {
        res.status(400).json({ message: "Missing required fields" });
        return;
      }

      if (!selectedSlot.startTime || !selectedSlot.endTime) {
        res.status(400).json({
          success: false,
          message: "Invalid slot format",
        });
        return;
      }

      const bookedSlots = await this.bookingService.getBookedSlots(
        tutorId,
        selectedDay
      );
      const isSlotAvailable = !bookedSlots.some(
        (bookedSlot) =>
          bookedSlot.startTime === selectedSlot.startTime &&
          bookedSlot.endTime === selectedSlot.endTime
      );

      if (!isSlotAvailable) {
        res.status(400).json({ message: "Selected slot is already booked" });
        return;
      }
      const booking = new Booking({
        userId,
        tutorId,
        selectedDay,
        selectedSlot,
        sessionFee,
        status: "pending",
        paymentStatus: "pending",
        bookingDate: new Date(),
      });

      const savedBooking = await this.bookingService.createBooking(booking);

      const receiptId = (
        savedBooking._id as mongoose.Types.ObjectId
      ).toString();

         const options = {
        amount: sessionFee * 100,
        currency: "USD",
        receipt: receiptId,
      };

      const order = await razorpay.orders.create(options);
      await this.bookingService.updateOrderId(receiptId, order.id);

      res.status(201).json({
        success: true,
        data: {
          savedBooking,
          orderId: order.id,
        },
      });
    } catch (error) {
      console.error("Error in createBooking:", error);
      res.status(500).json({
        success: false,
        message: "Error creating booking",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }


  async verifyPayment(req: CustomRequest, res: Response): Promise<void> {
    const { paymentId, orderId, signature, bookingId, tutorId,amount,creditedBy } = req.body;

    console.log("Received Payment Details:", {
      paymentId,
      orderId,
      signature,
      bookingId,
      tutorId,
      amount,
      creditedBy,
    });
    const generatedSignature = crypto
      .createHmac("sha256", keySecret!)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    if (generatedSignature === signature) {
      const updatedBooking = await this.bookingService.verifyAndCreditWallet(bookingId, tutorId, "paid", amount,creditedBy);

      res.status(200).json({
        success: true,
        message: "Payment verified and wallet credited successfully",
        booking: updatedBooking,
      });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Invalid payment signature" });
    }
  }

  async getBookingDetails(req: CustomRequest, res: Response): Promise<void> {
    const { bookingId } = req.params;
    try {
      const booking = await this.bookingService.getBookingDetails(bookingId);
      if (!booking) {
        res.status(404).json({ message: "Booking not found" });
        return;
      }
      res.status(200).json(booking);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async getBookedSlots(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { tutorId,selectedDay } = req.params;
     

      if (!selectedDay) {
        res
          .status(400)
          .json({ success: false, message: "Missing selected day" });
        return;
      }

      const bookedSlots = await this.bookingService.getBookedSlots(
        tutorId,
        selectedDay as string
      );

      res.status(200).json({ success: true, data: bookedSlots });
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching booked slots" });
    }
  }


  async getUserBookings(req:CustomRequest, res:Response):Promise<void>{
    try {


      const userId=req.user;


      console.log("userId",userId)
      if (!userId ) {
        res.status(400).json({ success: false, message: 'Invalid or missing user ID' });
        return;
      }
      const result=await this.bookingService.getUserBookings(userId)
     console.log("result of booings",result)
     
      res.status(200).json({ success: true,result});
      
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res
        .status(500)
        .json({ success: false, message: "internal server error" });
    }
  }



  async getTutorBookings(req:CustomRequest, res:Response):Promise<void>{
    try {


      const tutorId=req.user;


      console.log("tutorId",tutorId)
      if (!tutorId ) {
        res.status(400).json({ success: false, message: 'Invalid or missing tutor ID' });
        return;
      }
      const result=await this.bookingService.getTutorBookings(tutorId)
     console.log("result of booings",result)
     
      res.status(200).json({ success: true,result});
      
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res
        .status(500)
        .json({ success: false, message: "internal server error" });
    }
  }


 

}

export default BookingController;
