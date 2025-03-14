import { IBookingRepository } from "../../../repositories/interfaces/booking/ibookingRepository";
import { IBooking } from "../../../models/booking/bookingModel";
import IBookingService from "../../interfaces/booking/ibookingService";
import IWalletService from "../../interfaces/wallet/iwalletService";
import { IBookingDTO } from "../../interfaces/booking/ibookingDTO";
import EmailUtils from "../../../utils/emailUtils";
import moment from "moment";
import mongoose from "mongoose";

class BookingService implements IBookingService {
  private bookingRepository: IBookingRepository;

  private walletService: IWalletService;

  constructor(
    bookingRepository: IBookingRepository,
    walletService: IWalletService
  ) {
    this.bookingRepository = bookingRepository;
    this.walletService = walletService;
  }

  async createBooking(bookingData: IBookingDTO): Promise<IBooking> {
    try {
      return await this.bookingRepository.createBooking(bookingData);
    } catch (error:unknown) {
      throw new Error(" failed to create booking");
    }
  }

  async updateOrderId(
    bookingId: string,
    orderId: string
  ): Promise<IBooking | null> {
    try {
      return await this.bookingRepository.updateBookingOrderId(
        bookingId,
        orderId
      );
    } catch (error) {
      throw new Error(" failed to update orerid");
    }
  }

  async getBookingDetails(bookingId: string): Promise<IBooking | null> {
    try {
      return await this.bookingRepository.getBookingById(bookingId);
    } catch (error) {
      throw new Error("failed to fetch booking details");
    }
  }

  async getBookedSlots(
    tutorId: string,
    selectedDate: Date
  ): Promise<{ startTime: string; endTime: string }[]> {
    try {
      return await this.bookingRepository.getBookedSlots(tutorId, selectedDate);
    } catch (error) {
      throw new Error("failed to fetch booked slots");
    }
  }

  async getUserBookings(
    userId: string,
    page: 1,
    limit: 5
  ): Promise<{
    bookings: IBooking[];
    totalItems: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      return await this.bookingRepository.getBooking(userId,page,limit);
    } catch (error) {
      throw new Error("failed to fetch user bookings in user side");
    }
  }

  async getTutorBookings(tutorId: string,page:number,limit:number): Promise<{bookings:IBooking[],total:number}> {
    try {
      return await this.bookingRepository.getTutorBookings(tutorId,page,limit);
    } catch (error) {
      throw new Error("failed to fetch bookings in tutor side");
    }
  }

  async updatePaymentStatus(
    bookingId: string,
    status: string,
    failureReason?: string
  ): Promise<IBooking | null> {
    try {
      return await this.bookingRepository.updateBookingPaymentStatus(
        bookingId,
        status,
        failureReason
      );
    } catch (error) {
      throw new Error(
        `Failed to update payment status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async verifyAndCreditWallet(
    bookingId: string,
    tutorId: string,
    paymentStatus: string,
    amount: number,
    creditedBy: string
  ): Promise<void> {
    try {
      if (paymentStatus === "paid") {
        await this.bookingRepository.updateBookingPaymentStatus(
          bookingId,
          paymentStatus
        );

        await this.walletService.creditTutorWallet(
          tutorId,
          amount,
          "Booking Payment",
          creditedBy
        );
      } else {
        throw new Error("Payment verification failed");
      }
    } catch (error) {
      await this.updatePaymentStatus(
        bookingId,
        "failed",
        error instanceof Error ? error.message : "Payment verification failed"
      );
      throw error;
    }
  }

  async getFailedBooking(
    userId: string,
    tutorId: string,
    selectedDate: Date,
    selectedSlot: { startTime: string; endTime: string }
  ): Promise<IBooking | null> {
    try {
      return await this.bookingRepository.getFailedBooking(
        userId,
        tutorId,
        selectedDate,
        selectedSlot
      );
    } catch (error) {
      throw new Error("Failed to check existing booking");
    }
  }

  async startSession(bookingId: string): Promise<IBooking | null> {
    console.log("start session from service", bookingId);
    return await this.bookingRepository.startSession(bookingId, new Date());
  }

  async completeSession(bookingId: string): Promise<IBooking | null> {
    return await this.bookingRepository.completeSession(bookingId, new Date());
  }

  async cancelBooking(
    tutorId: string,
    bookingId: string
  ): Promise<IBooking | null> {
    const booking = await this.bookingRepository.findById(bookingId);

    if (!booking) throw new Error("Booking not found");

    if (booking.tutorId.toString() !== tutorId) {
      throw new Error("Unauthorized: You can only cancel your own sessions");
    }

    const sessionStartDateTime = new Date(booking.selectedDate);

    console.log("Raw startTime from DB:", booking.selectedSlot.startTime);

    // Convert 12-hour format to 24-hour format using moment.js
    const formattedTime = moment(
      booking.selectedSlot.startTime,
      "hh:mm A"
    ).format("HH:mm");
    const [hours, minutes] = formattedTime.split(":").map(Number);

    console.log("Converted 24-hour time:", hours, minutes);

    sessionStartDateTime.setHours(hours, minutes, 0, 0);

    const now = new Date();
    console.log("Now:", now);
    console.log("Session Start DateTime:", sessionStartDateTime);

    const timeDifference = sessionStartDateTime.getTime() - now.getTime();
    const hoursDifference = timeDifference / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      throw new Error(
        "Cannot cancel a session less than 24 hours before it starts"
      );
    }

    const updatedBooking = await this.bookingRepository.cancelBooking(
      bookingId
    );

    if (updatedBooking) {
      const refundAmount = updatedBooking.sessionFee;
      console.log("refundAmount", refundAmount);
      if (refundAmount > 0) {
        // await this.walletService.withdrawFunds(tutorId, refundAmount);
        await this.walletService.deductFunds(tutorId, refundAmount);
        console.log("Deduction function executed");

        let userWallet = await this.walletService.getUserWallet(
          updatedBooking.userId.toString()
        );

        if (!userWallet) {
          console.log(
            `User wallet not found, creating a new wallet for user ${updatedBooking.userId}`
          );
          userWallet = await this.walletService.createUserWallet(
            updatedBooking.userId.toString()
          );
        }

        await this.walletService.creditUserWallet(
          updatedBooking.userId.toString(),
          refundAmount,
          "Refund for cancelled session"
        );

        try {
          const populatedBooking =
            await this.bookingRepository.getPopulatedBooking(bookingId);

          if (populatedBooking && populatedBooking.userId) {
            const formattedDate = moment(populatedBooking.selectedDate).format(
              "MMMM D, YYYY"
            );
            interface PopulatedUser {
              email: string;
              fullName: string;
            }
            interface PopulatedTutor {
              name: string;
            }

            const userId = populatedBooking.userId as unknown as PopulatedUser;
            const tutorId =
              populatedBooking.tutorId as unknown as PopulatedTutor;

            await EmailUtils.sendSessionCancellationNotification(
              userId.email,
              userId.fullName,
              {
                tutorName: tutorId.name,
                sessionDate: formattedDate,
                sessionTime: `${populatedBooking.selectedSlot.startTime} - ${populatedBooking.selectedSlot.endTime}`,
                refundAmount: refundAmount,
              }
            );
            console.log(`Cancellation notification sent to ${userId.email}`);
          }
        } catch (emailError) {
          console.error("Failed to send cancellation email:", emailError);
        }

        console.log(
          `Refunded ₹${refundAmount} to user ${updatedBooking.userId}`
        );
      }
    }
    return updatedBooking;
  }

  async getTutorSessionStatics(tutorId: string): Promise<{
    upcomingSessions: number;
    completeSessions: number;
    cancelSessions: number;
  }> {
    const upcomingSessions =
      await this.bookingRepository.getUpcomingSessionsCount(tutorId);
    const completeSessions =
      await this.bookingRepository.getCompletedSessionsCount(tutorId);
    const cancelSessions =
      await this.bookingRepository.getCancelledSesionsCount(tutorId);

    return { upcomingSessions, completeSessions, cancelSessions };
  }



  async cancelBookingUser(bookingId: string, userId: string, cancellationReason: string): Promise<IBooking | null> {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const booking = await this.bookingRepository.getBookings(bookingId);
      if (!booking) {
        throw new Error('Booking not found');
      }
  
      if (booking.userId._id.toString() !== userId) {
        throw new Error('Unauthorized: Booking does not belong to this user');
      }
  
      if (booking.status === 'cancelled') {
        throw new Error('Booking is already cancelled');
      }
      
      if (booking.status === 'completed' || booking.status === 'in-progress') {
        throw new Error('Cannot cancel a completed or in-progress session');
      }
  
      const sessionDate = new Date(booking.selectedDate);
      const parseTime = (timeStr: string) => {
        const [time, modifier] = timeStr.split(" ");
        let [hours, minutes] = time.split(":").map(Number);
  
        if (modifier === "PM" && hours !== 12) hours += 12;
        if (modifier === "AM" && hours === 12) hours = 0;
  
        return { hours, minutes };
      };
  
      const { hours, minutes } = parseTime(booking.selectedSlot.startTime);
      sessionDate.setHours(hours, minutes, 0, 0);
      
      const now = new Date();
      const timeDifference = sessionDate.getTime() - now.getTime();
      const hoursDifference = timeDifference / (1000 * 60 * 60);
      
      if (hoursDifference < 24) {
        throw new Error('Bookings can only be cancelled at least 24 hours before the session');
      }
  
      const cancelledBooking = await this.bookingRepository.cancelBookingUser(
        bookingId,
        cancellationReason
      );
  
      if (!cancelledBooking) {
        throw new Error('Failed to cancel booking');
      }
  
      let userWallet = await this.walletService.getUserWallet(userId);
      
      if (!userWallet) {
        userWallet = await this.walletService.createUserWallet(userId);
      }
  
      await this.walletService.creditUserWallet(
        userId,
        booking.sessionFee,
        `Refund for cancelled booking`
      );
  
      if (booking.paymentStatus === 'paid') {
        await this.walletService.deductFunds(
          booking.tutorId._id.toString(),
          booking.sessionFee
        );
      }
  
      try {
        const populatedBooking = await this.bookingRepository.getPopulatedBooking(bookingId);
  
        if (populatedBooking && populatedBooking.userId) {
          const formattedDate = moment(populatedBooking.selectedDate).format(
            "MMMM D, YYYY"
          );
          
          interface PopulatedUser {
            email: string;
            fullName: string;
          }
          
          interface PopulatedTutor {
            email: string;
            name: string;
          }
  
          const userId = populatedBooking.userId as unknown as PopulatedUser;
          const tutorId = populatedBooking.tutorId as unknown as PopulatedTutor;
          
          await EmailUtils.sendTutorCancellationNotification(
            tutorId.email,
            tutorId.name,
            {
              userName:userId.fullName,
              tutorName:tutorId.name,
              sessionDate: formattedDate,
              sessionTime: `${populatedBooking.selectedSlot.startTime} - ${populatedBooking.selectedSlot.endTime}`,
              refundAmount: booking.sessionFee,
            }
          );
        }
      } catch (emailError) {
        console.error('Failed to send cancellation email:', emailError);
      }
  
      await session.commitTransaction();
      session.endSession();
      
      return cancelledBooking;
        
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

}

export default BookingService;
