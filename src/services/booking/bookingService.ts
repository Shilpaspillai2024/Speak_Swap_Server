import { BookingRepository } from "../../repositories/booking/bookingRepository";
import { IBooking } from "../../models/booking/bookingModel";
import WalletService from "../wallet/walletService";


class BookingService{
    private bookingRepository: BookingRepository;

    private walletService:WalletService;

    constructor(bookingRepository: BookingRepository,walletService:WalletService) {
      this.bookingRepository = bookingRepository;
      this.walletService = walletService;
    }


    async createBooking(bookingData:IBooking):Promise<IBooking>{
        return await this.bookingRepository.createBooking(bookingData);
    }


    async updateOrderId(bookingId: string, orderId: string): Promise<IBooking | null> {
        return await this.bookingRepository.updateBookingOrderId(bookingId, orderId);
      }
    
      // async updatePaymentStatus(bookingId: string, paymentStatus: string): Promise<IBooking | null> {
      //   return await this.bookingRepository.updateBookingPaymentStatus(bookingId, paymentStatus);
      // }


      async getBookingDetails(bookingId: string): Promise<IBooking | null> {
        return await this.bookingRepository.getBookingById(bookingId)
      }


      async getBookedSlots(tutorId: string, selectedDay: string): Promise<{ startTime: string; endTime: string }[]> {
        return await this.bookingRepository.getBookedSlots(tutorId, selectedDay);
      }


      async getUserBookings(userId:string):Promise<IBooking[]>{
        return await this.bookingRepository.getBooking(userId)
      }


      async getTutorBookings(tutorId:string):Promise<IBooking[]>{
        return await this.bookingRepository.getTutorBookings(tutorId)
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