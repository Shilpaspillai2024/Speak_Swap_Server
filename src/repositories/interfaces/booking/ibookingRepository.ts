import { IBooking } from "../../../models/booking/bookingModel";

export interface IBookingRepository{
    createBooking(bookingData:IBooking):Promise<IBooking>;
    updateBookingOrderId(bookingId:string,orderId:string): Promise<IBooking | null>
    updateBookingPaymentStatus(bookingId: string, paymentStatus: string): Promise<IBooking | null>;
    getBookingById(bookingId:string):Promise<IBooking | null>;
    getBookedSlots(tutorId: string, selectedDay: string): Promise<{ startTime: string; endTime: string }[]>;
    getBooking(userId:string):Promise<IBooking[] >
    getTutorBookings(tutorId:string):Promise<IBooking[]>

  

}