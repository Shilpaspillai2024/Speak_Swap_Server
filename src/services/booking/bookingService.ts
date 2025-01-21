import { BookingRepository } from "../../repositories/booking/bookingRepository";
import { IBooking } from "../../models/booking/bookingModel";

class BookingService{
    private bookingRepository: BookingRepository;

    constructor(bookingRepository: BookingRepository) {
      this.bookingRepository = bookingRepository;
    }


    async createBooking(bookingData:IBooking):Promise<IBooking>{
        return await this.bookingRepository.createBooking(bookingData);
    }


    async updateOrderId(bookingId: string, orderId: string): Promise<IBooking | null> {
        return await this.bookingRepository.updateBookingOrderId(bookingId, orderId);
      }
    
      async updatePaymentStatus(bookingId: string, paymentStatus: string): Promise<IBooking | null> {
        return await this.bookingRepository.updateBookingPaymentStatus(bookingId, paymentStatus);
      }


      async getBookingDetails(bookingId: string): Promise<IBooking | null> {
        return await this.bookingRepository.getBookingById(bookingId)
      }


      async getBookedSlots(tutorId: string, selectedDay: string): Promise<{ startTime: string; endTime: string }[]> {
        return await this.bookingRepository.getBookedSlots(tutorId, selectedDay);
      }
}

export default BookingService;