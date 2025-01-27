import { IBookingRepository } from "../../../repositories/interfaces/booking/ibookingRepository";
import { IBooking } from "../../../models/booking/bookingModel";
import IBookingService from "../../interfaces/booking/ibookingService";
import IWalletService from "../../interfaces/wallet/iwalletService";

class BookingService implements IBookingService {
    private bookingRepository: IBookingRepository;

    private walletService:IWalletService;

    constructor(bookingRepository: IBookingRepository,walletService:IWalletService) {
      this.bookingRepository = bookingRepository;
      this.walletService = walletService;
    }


    async createBooking(bookingData:IBooking):Promise<IBooking>{

      try {
        return await this.bookingRepository.createBooking(bookingData);
        
      } catch (error) {
        throw new Error(" failed to create booking")
      }
       
    }


    async updateOrderId(bookingId: string, orderId: string): Promise<IBooking | null> {
      try {
        
        return await this.bookingRepository.updateBookingOrderId(bookingId, orderId);
      } catch (error) {
        throw new Error(" failed to update orerid")
      }
      }

      async getBookingDetails(bookingId: string): Promise<IBooking | null> {
        try {
          
          return await this.bookingRepository.getBookingById(bookingId)
        } catch (error) {
          throw new Error("failed to fetch booking details")
        }
      }


      async getBookedSlots(tutorId: string, selectedDay: string): Promise<{ startTime: string; endTime: string }[]> {
        try {
          return await this.bookingRepository.getBookedSlots(tutorId, selectedDay);
          
        } catch (error) {
          throw new Error("failed to fetch booked slots")
        }
      }


      async getUserBookings(userId:string):Promise<IBooking[]>{

        try {
          return await this.bookingRepository.getBooking(userId)
          
        } catch (error) {
          throw new Error("failed to fetch user bookings in user side")
        }
      }


      async getTutorBookings(tutorId:string):Promise<IBooking[]>{

        try {
          return await this.bookingRepository.getTutorBookings(tutorId)
          
        } catch (error) {
          throw new Error("failed to fetch bookings in tutor side")
        }
      }

      async verifyAndCreditWallet(
        bookingId:string,
        tutorId: string,
        paymentStatus: string,
        amount: number,
        creditedBy:string,
      ): Promise<void> {
        if (paymentStatus === "paid") {
          



          await this.bookingRepository.updateBookingPaymentStatus(bookingId, paymentStatus);

          await this.walletService.creditTutorWallet(tutorId, amount, "Booking Payment",creditedBy);
  
        } else {
          throw new Error("Payment verification failed");
        }
      }

     
}

export default BookingService;