import { IBookingRepository } from "../../interfaces/booking/ibookingRepository";
import Booking from "../../../models/booking/bookingModel";
import { IBookingDTO } from "../../../services/interfaces/booking/ibookingDTO";
import { IBooking } from "../../../models/booking/bookingModel";
import mongoose from "mongoose";

class BookingRepository implements IBookingRepository {
  async createBooking(bookingData: IBookingDTO): Promise<IBooking> {
    const booking = new Booking(bookingData);
    await booking.save();
    return booking;
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
    paymentStatus: string
  ): Promise<IBooking | null> {
    const status = paymentStatus === "paid" ? "confirmed" : "pending";

    return await Booking.findByIdAndUpdate(
      bookingId,
      { paymentStatus, status },
      { new: true }
    );
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
      status: { $nin: ["pending", "completed", "cancelled"] },
    });

    return bookings.map((booking) => ({
      startTime: booking.selectedSlot.startTime,
      endTime: booking.selectedSlot.endTime,
    }));
  }

  async getBooking(userId: string): Promise<IBooking[]> {
    try {
      const bookings = await Booking.find({
        userId: new mongoose.Types.ObjectId(userId),
        status: "confirmed",
        paymentStatus: "paid",
      })
        .populate("tutorId", "_id name email profilePhoto timeZone")
        .populate("userId", "_id fullName email")
        .sort({ bookingDate: -1 });
      return bookings;
    } catch (error) {
      throw new Error("Failed to fetch bookings");
    }
  }

  async getTutorBookings(tutorId: string): Promise<IBooking[]> {
    try {
      const bookings = await Booking.find({
        tutorId: new mongoose.Types.ObjectId(tutorId),
        status: "confirmed",
        // status:{$in:["pending","confirmed"]},
        paymentStatus: "paid",
      })
        .populate(
          "userId",
          "_id fullName email phone profilePhoto knownLanguages learnLanguage learnProficiency"
        )
        .populate("tutorId", "_id name email profilePhoto teachLanguage")
        .sort({ createdAt: -1 });

      return bookings;
    } catch (error) {
      throw new Error("Failed to fetch bookings");
    }
  }

  async startSession(
    bookingId: string,
    sessionStartTime: Date
  ): Promise<IBooking | null> {
    console.log("start sesssion from repos",bookingId,sessionStartTime)
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
      bookingId,{
        status:"cancelled",},
        {new :true}
    );
  }


  async findById(bookingId: string): Promise<IBooking | null> {
    return await Booking.findById(bookingId)
  }


  async getPopulatedBooking(bookingId: string): Promise<IBooking | null> {
    return await Booking.findById(bookingId)
    .populate("userId","_id fullName email phone")
    .populate("tutorId","_id name email profilePhoto ")
  }



  async getUpcomingSessionsCount(tutorId: string): Promise<number> {
   return await Booking.countDocuments({
    tutorId,
    status:"confirmed"
   })
 }

 async getCompletedSessionsCount(tutorId: string): Promise<number> {
   return await Booking.countDocuments({
    tutorId,
    status:"completed"
   })
 }

 async getCancelledSesionsCount(tutorId: string): Promise<number> {
   return await Booking.countDocuments({
    tutorId,
    status:"cancelled"
   })
 }







}

export default BookingRepository;
