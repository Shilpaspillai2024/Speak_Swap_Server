import { Response } from "express";
import { CustomRequest } from "../../middlewares/authMiddleware";
import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";
import IBookingService from "../../services/interfaces/booking/ibookingService";
import { IBookingDTO } from "../../services/interfaces/booking/ibookingDTO";
import verifyRazorpaySignature from "../../utils/verifyRazorpayUtils";
import {HttpStatus} from "../../constants/httpStatus"
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

      const { tutorId, selectedSlot, sessionFee } = req.body;

      const selectedDate = new Date(req.body.selectedDate);

      if (
        !userId ||
        !tutorId ||
        !selectedDate ||
        !selectedSlot ||
        !sessionFee
      ) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: "Missing required fields" });
        return;
      }

      if (!selectedSlot.startTime || !selectedSlot.endTime) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Invalid slot format",
        });
        return;
      }

      const bookedSlots = await this.bookingService.getBookedSlots(
        tutorId,
        selectedDate
      );
      const isSlotAvailable = !bookedSlots.some(
        (bookedSlot) =>
          bookedSlot.startTime === selectedSlot.startTime &&
          bookedSlot.endTime === selectedSlot.endTime
      );

      if (!isSlotAvailable) {
        res.status(HttpStatus.BAD_REQUEST).json({ message: "Selected slot is already booked" });
        return;
      }

      const existingBooking = await this.bookingService.getFailedBooking(
        userId,
        tutorId,
        selectedDate,
        selectedSlot
      );

     
      if (existingBooking) {
        const bookingId = String(existingBooking._id);

        await this.bookingService.updatePaymentStatus(bookingId, "pending");

        const options = {
          amount: sessionFee * 100,
          currency: "USD",
          receipt: bookingId,
        };

        const order = await razorpay.orders.create(options);
        await this.bookingService.updateOrderId(bookingId, order.id);

        res.status(HttpStatus.CREATED).json({
          success: true,
          data: {
            savedBooking: existingBooking,
            orderId: order.id,
          },
        });
        return;
      }

      const booking: IBookingDTO = {
        userId: new mongoose.Types.ObjectId(userId),
        tutorId,
        selectedDate,
        selectedSlot,
        sessionFee,
        status: "pending",
        paymentStatus: "pending",
        bookingDate: new Date(),
      };

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

      res.status(HttpStatus.CREATED).json({
        success: true,
        data: {
          savedBooking,
          orderId: order.id,
        },
      });
    } catch (error) {
      console.error("Error in createBooking:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Error creating booking",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async verifyPayment(req: CustomRequest, res: Response): Promise<void> {
    const {
      paymentId,
      orderId,
      signature,
      bookingId,
      tutorId,
      amount,
      creditedBy,
    } = req.body;

    if (
      !paymentId ||
      !orderId ||
      !signature ||
      !bookingId ||
      !tutorId ||
      !amount ||
      !creditedBy
    ) {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ success: false, message: "Missing required fields" });
      return;
    }

    console.log("Received Payment Details:", {
      paymentId,
      orderId,
      signature,
      bookingId,
      tutorId,
      amount,
      creditedBy,
    });

    try {
      const isValid = verifyRazorpaySignature(orderId, paymentId, signature);

      if (!isValid) {
        await this.bookingService.updatePaymentStatus(
          bookingId,
          "failed",
          "Signature mismatch"
        );
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "Payment verification failed" });
        return;
      }

      const updatedBooking = await this.bookingService.verifyAndCreditWallet(
        bookingId,
        tutorId,
        "paid",
        amount,
        creditedBy
      );

      res.status(HttpStatus.OK).json({
        success: true,
        message: "Payment verified and wallet credited successfully",
        booking: updatedBooking,
      });
    } catch (error) {
      console.log("payment verification error:", error);
      try {
        await this.bookingService.updatePaymentStatus(
          bookingId,
          "failed",
          error instanceof Error ? error.message : "Unknown payment error"
        );
      } catch (updateError) {
        console.error("Failed to update payment status:", updateError);
      }

      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Payment verification failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async markPaymentAsFailed(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { bookingId, reason } = req.body;

      if (!bookingId) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "Booking ID is required" });
        return;
      }

      const updatedBooking = await this.bookingService.updatePaymentStatus(
        bookingId,
        "failed",
        reason || "Payment failed"
      );

      if (!updatedBooking) {
        res.status(HttpStatus.NOT_FOUND).json({ success: false, message: "Booking not found" });
        return;
      }

      res
        .status(HttpStatus.OK)
        .json({ success: true, message: "Payment marked as failed" });
      return;
    } catch (error) {
      console.error("Error marking payment as failed:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async getBookingDetails(req: CustomRequest, res: Response): Promise<void> {
    const { bookingId } = req.params;
    try {
      const booking = await this.bookingService.getBookingDetails(bookingId);
      if (!booking) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "Booking not found" });
        return;
      }
      res.status(HttpStatus.OK).json(booking);
    } catch (error) {
      console.error("Error fetching booking details:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
  }

  async getBookedSlots(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { tutorId } = req.params;

      const selectedDate = new Date(req.params.selectedDate);
      if (!selectedDate) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "Missing selected day" });
        return;
      }

      const bookedSlots = await this.bookingService.getBookedSlots(
        tutorId,
        selectedDate
      );

      res.status(HttpStatus.OK).json({ success: true, data: bookedSlots });
    } catch (error) {
      console.error("Error fetching booked slots:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "Error fetching booked slots" });
    }
  }

  async getUserBookings(req: CustomRequest, res: Response): Promise<void> {
    try {
      const userId = req.user;
      console.log("userId", userId);
      if (!userId) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "Invalid or missing user ID" });
        return;
      }
      const result = await this.bookingService.getUserBookings(userId);
      console.log("result of booings", result);

      res.status(HttpStatus.OK).json({ success: true, result });
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "internal server error" });
    }
  }

  async getTutorBookings(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user;

      console.log("tutorId", tutorId);
      if (!tutorId) {
        res
          .status(HttpStatus.BAD_REQUEST)
          .json({ success: false, message: "Invalid or missing tutor ID" });
        return;
      }
      const result = await this.bookingService.getTutorBookings(tutorId);
      console.log("result of booings", result);

      res.status(HttpStatus.OK).json({ success: true, result });
    } catch (error) {
      console.error("Error fetching user bookings:", error);
      res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: "internal server error" });
    }
  }

  async startSession(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;

      console.log("booking id for strt session", bookingId);

      const booking = await this.bookingService.startSession(bookingId);
      if (!booking) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "Booking not found" });
        return;
      }
      res.status(HttpStatus.OK).json({ message: "Session started", booking });
      return;
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error starting session", error });
      return;
    }
  }

  async completeSession(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;

      const booking = await this.bookingService.completeSession(bookingId);
      if (!booking) {
        res.status(HttpStatus.NOT_FOUND).json({ message: "Booking not found" });
        return;
      }
      res.status(HttpStatus.OK).json({ message: "Session completed", booking });
      return;
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Error completeting session", error });
      return;
    }
  }

  // cancel booking

  async cancelBooking(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { bookingId } = req.params;
      const tutorId = req.user;

      if (!tutorId) {
        res.status(HttpStatus.FORBIDDEN).json({ message: "Unauthorized" });
        return;
      }

      const result = await this.bookingService.cancelBooking(
        tutorId,
        bookingId
      );
      res
        .status(HttpStatus.OK)
        .json({ message: "Session cancelled successfully", result });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cancel session";
      res.status(HttpStatus.BAD_REQUEST).json({ message: errorMessage });
    }
  }

  async getTutorDashboardStats(
    req: CustomRequest,
    res: Response
  ): Promise<void> {
    try {
      const { tutorId } = req.params;
      const stats = await this.bookingService.getTutorSessionStatics(tutorId);
      res.status(HttpStatus.OK).json(stats);
    } catch (error) {
      console.error("Error fetching tutor dashboard stats:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Server Error" });
    }
  }
}

export default BookingController;
