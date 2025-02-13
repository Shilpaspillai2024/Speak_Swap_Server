import { IBooking } from "../../../models/booking/bookingModel";
import { IBookingDTO } from "../../../services/interfaces/booking/ibookingDTO";

export interface IBookingRepository{
    createBooking(bookingData:IBookingDTO):Promise<IBooking>;
    updateBookingOrderId(bookingId:string,orderId:string): Promise<IBooking | null>
    updateBookingPaymentStatus(bookingId: string, paymentStatus: string): Promise<IBooking | null>;
    getBookingById(bookingId:string):Promise<IBooking | null>;
    getBookedSlots(tutorId: string, selectedDate:Date): Promise<{ startTime: string; endTime: string }[]>;
    getBooking(userId:string):Promise<IBooking[] >
    getTutorBookings(tutorId:string):Promise<IBooking[]>

  

}