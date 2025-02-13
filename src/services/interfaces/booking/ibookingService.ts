import { IBooking } from "../../../models/booking/bookingModel";
import { IBookingDTO } from "./ibookingDTO";

interface IBookingService {
  createBooking(bookingData: IBookingDTO): Promise<IBooking>;

  updateOrderId(bookingId: string, orderId: string): Promise<IBooking | null>;

  getBookingDetails(bookingId: string): Promise<IBooking | null>;

  getBookedSlots(
    tutorId: string,
    selectedDate:Date
  ): Promise<{ startTime: string; endTime: string }[]>;

  getUserBookings(userId: string): Promise<IBooking[]>;

  getTutorBookings(tutorId: string): Promise<IBooking[]>;

  verifyAndCreditWallet(
    bookingId: string,
    tutorId: string,
    paymentStatus: string,
    amount: number,
    creditedBy: string
  ): Promise<void>;
}

export default IBookingService;
