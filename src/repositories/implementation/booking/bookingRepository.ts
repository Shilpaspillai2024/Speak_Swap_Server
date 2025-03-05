import { IBookingRepository } from "../../interfaces/booking/ibookingRepository";
import Booking from "../../../models/booking/bookingModel";
import { IBookingDTO } from "../../../services/interfaces/booking/ibookingDTO";
import { IBooking } from "../../../models/booking/bookingModel";

import mongoose from "mongoose";

class BookingRepository implements IBookingRepository {

  async createBooking(bookingData: IBookingDTO): Promise<IBooking> {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      
      const existingBooking = await Booking.findOne(
        {
          tutorId: bookingData.tutorId,
          selectedDate: bookingData.selectedDate,
          "selectedSlot.startTime": bookingData.selectedSlot.startTime,
          "selectedSlot.endTime": bookingData.selectedSlot.endTime,
          status: { $nin: ["cancelled", "payment_failed"] },
        }
      ).session(session);
  
      if (existingBooking) {
        throw new Error("Session already booked!");
      }
  
     
      const booking = new Booking(bookingData);
      await booking.save({ session });
  
    
      await session.commitTransaction();
      session.endSession();
  
      return booking;
    } catch (error:unknown) {
      await session.abortTransaction();
      session.endSession();
      if (error instanceof Error) {
        throw new Error(error.message); 
      } else {
        throw new Error("An unexpected error occurred"); 
      }
    }
  }
  

  async updateBookingOrderId(
    bookingId: string,
    orderId: string
  ): Promise<IBooking | null> {
    console.log("orderId", orderId);
    return await Booking.findByIdAndUpdate(
      bookingId,
      { orderId },
      { new: true }
    );
  }

  async updateBookingPaymentStatus(
    bookingId: string,
    paymentStatus: string,
    failureReason?: string
  ): Promise<IBooking | null> {
    interface BookingStatusUpdate {
      paymentStatus: string;
      status: string;
      failureReason?: string;
    }

    const status =
      paymentStatus === "paid"
        ? "confirmed"
        : paymentStatus === "failed"
        ? "payment_failed"
        : "pending";

    const updateData: BookingStatusUpdate = { paymentStatus, status };

    if (failureReason && paymentStatus === "failed") {
      updateData.failureReason = failureReason;
    }

    return await Booking.findByIdAndUpdate(bookingId, updateData, {
      new: true,
    });
  }

  async getFailedBooking(
    userId: string,
    tutorId: string,
    selectedDate: Date,
    selectedSlot: { startTime: string; endTime: string }
  ): Promise<IBooking | null> {
    return await Booking.findOne({
      userId,
      tutorId,
      selectedDate,
      "selectedSlot.startTime": selectedSlot.startTime,
      "selectedSlot.endTime": selectedSlot.endTime,
      status: "payment_failed",
      paymentStatus: "failed",
    });
  }

  async getBookingById(bookingId: string): Promise<IBooking | null> {
    return await Booking.findById(bookingId).populate("tutorId", "name");
  }

  async getBookedSlots(
    tutorId: string,
    selectedDate: Date
  ): Promise<{ startTime: string; endTime: string }[]> {
    const bookings = await Booking.find({
      tutorId,
      selectedDate,
      status: { $nin: ["pending", "completed", "cancelled", "payment_failed"] },
    });

    return bookings.map((booking) => ({
      startTime: booking.selectedSlot.startTime,
      endTime: booking.selectedSlot.endTime,
    }));
  }

  async getBooking(
    userId: string,
    page = 1,
    limit = 5
  ): Promise<{
    bookings: IBooking[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {


      const skip=(page-1)*limit;

      const totalItems=await Booking.countDocuments({
        userId: new mongoose.Types.ObjectId(userId),
        $or: [
          { status: "confirmed", paymentStatus: "paid" },
          { status: "payment_failed", paymentStatus: "failed" },
        ],
      })

      const bookings = await Booking.find({
        userId: new mongoose.Types.ObjectId(userId),
        $or: [
          { status: "confirmed", paymentStatus: "paid" },
          { status: "payment_failed", paymentStatus: "failed" },
        ],
      })
        .populate("tutorId", "_id name email profilePhoto timeZone")
        .populate("userId", "_id fullName email")
        .sort({ bookingDate: -1 })
        .skip(skip)
        .limit(limit);
        
      const totalPages = Math.ceil(totalItems / limit);
      
      return {
        bookings,
        totalItems,
        currentPage: page,
        totalPages
      };

      
    } catch (error) {
      throw new Error("Failed to fetch bookings");
    }
  }

  async getTutorBookings(tutorId: string,page:number,limit:number): Promise<{bookings:IBooking[],total:number}> {
    try {


      const skip=(page-1)*limit;

      const total = await Booking.countDocuments({
        tutorId: new mongoose.Types.ObjectId(tutorId),
        status: "confirmed",
        paymentStatus: "paid",
      });
      const bookings = await Booking.find({
        tutorId: new mongoose.Types.ObjectId(tutorId),
        status: "confirmed",
        paymentStatus: "paid",
      })
        .populate(
          "userId",
          "_id fullName email phone profilePhoto knownLanguages learnLanguage learnProficiency"
        )
        .populate("tutorId", "_id name email profilePhoto teachLanguage")
        .sort({ createdAt: -1 })
        .skip(skip) 
        .limit(limit);

        return { bookings, total };
    } catch (error) {
      throw new Error("Failed to fetch bookings");
    }
  }

  async startSession(
    bookingId: string,
    sessionStartTime: Date
  ): Promise<IBooking | null> {
    console.log("start sesssion from repos", bookingId, sessionStartTime);
    return await Booking.findByIdAndUpdate(
      bookingId,
      { sessionStartTime, status: "in-progress" },
      { new: true }
    );
  }

  async completeSession(
    bookingId: string,
    sessionEndTime: Date
  ): Promise<IBooking | null> {
    const booking = await Booking.findById(bookingId);
    if (!booking || !booking.sessionStartTime) return null;

    const duration = Math.round(
      (sessionEndTime.getTime() - booking.sessionStartTime.getTime()) / 6000
    );
    return await Booking.findByIdAndUpdate(
      bookingId,
      {
        sessionEndTime,
        duration,
        status: "completed",
      },
      {
        new: true,
      }
    );
  }

  async cancelBooking(bookingId: string): Promise<IBooking | null> {
    return await Booking.findByIdAndUpdate(
      bookingId,
      {
        status: "cancelled",
      },
      { new: true }
    );
  }

  async findById(bookingId: string): Promise<IBooking | null> {
    return await Booking.findById(bookingId);
  }

  async getPopulatedBooking(bookingId: string): Promise<IBooking | null> {
    return await Booking.findById(bookingId)
      .populate("userId", "_id fullName email phone")
      .populate("tutorId", "_id name email profilePhoto ");
  }

  async getUpcomingSessionsCount(tutorId: string): Promise<number> {
    return await Booking.countDocuments({
      tutorId,
      status: "confirmed",
    });
  }

  async getCompletedSessionsCount(tutorId: string): Promise<number> {
    return await Booking.countDocuments({
      tutorId,
      status: "completed",
    });
  }

  async getCancelledSesionsCount(tutorId: string): Promise<number> {
    return await Booking.countDocuments({
      tutorId,
      status: "cancelled",
    });
  }



  async cancelBookingUser(bookingId: string, cancellationReason: string): Promise<IBooking | null> {
     try {

      const booking=await Booking.findByIdAndUpdate(bookingId,{
        status: 'cancelled',
          paymentStatus: 'refunded',
          cancellationReason,
          cancelledAt: new Date()
      },
      {new:true}
    );
    return booking;
      
     } catch (error) {
      console.error('Error in cancelBooking repository:', error);
      throw error;
     }
  }


 async getBookings(bookingId: string): Promise<IBooking | null> {
    try {

      const booking=await Booking.findById(bookingId)
      .populate('userId')
      .populate('tutorId')
      return booking
      
    } catch (error) {
      console.error('Error in getBookingById repository:', error);
      throw error;
    }
  }
}

export default BookingRepository;
