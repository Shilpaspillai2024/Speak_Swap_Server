import { BookingRepository } from "../../booking/bookingRepository";
import Booking from "../../../models/booking/bookingModel";
import { IBooking } from "../../../models/booking/bookingModel";
import mongoose from "mongoose";

class BookingRepositoryImplementation implements BookingRepository {
  async createBooking(bookingData: IBooking): Promise<IBooking> {
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
    selectedDay: string
  ): Promise<{ startTime: string; endTime: string }[]> {
    const bookings = await Booking.find({
      tutorId,
      selectedDay,
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
      })
        .populate("tutorId", "name email profilePhoto timeZone")
        .populate("userId", "fullName email")
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
      })
        .populate("userId","fullName email phone profilePhoto knownLanguages learnLanguage learnProficiency")
        .populate("tutorId","name email profilePhoto teachLanguage")
        .sort({ createdAt: -1 });

      return bookings;
    } catch (error) {
      throw new Error("Failed to fetch bookings");
    }
  }



 


   
}

export default BookingRepositoryImplementation;
