import { IBooking } from "../../../models/booking/bookingModel";
import { IBookingDTO } from "../../../services/interfaces/booking/ibookingDTO";





export interface IBookingRepository{
    createBooking(bookingData:IBookingDTO):Promise<IBooking>;
    updateBookingOrderId(bookingId:string,orderId:string): Promise<IBooking | null>
    updateBookingPaymentStatus(bookingId: string, paymentStatus: string,failureReason?:string): Promise<IBooking | null>;
    getBookingById(bookingId:string):Promise<IBooking | null>;
    getBookedSlots(tutorId: string, selectedDate:Date): Promise<{ startTime: string; endTime: string }[]>;
    getBooking(userId:string,page:number,limit:number):Promise<{bookings:IBooking[],totalItems: number;
        currentPage: number;
        totalPages: number;}>
    getTutorBookings(tutorId:string):Promise<IBooking[]>
    startSession(bookingId:string,sessionStartTime:Date):Promise<IBooking | null>;
    completeSession(bookingId:string,sessionEndTime:Date):Promise<IBooking | null>;
    cancelBooking(bookingId:string):Promise<IBooking | null>
    findById(bookingId:string):Promise<IBooking | null>
    getPopulatedBooking(bookingId:string):Promise<IBooking | null>

    getUpcomingSessionsCount(tutorId:string):Promise<number>;
    getCompletedSessionsCount(tutorId:string):Promise<number>;
    getCancelledSesionsCount(tutorId:string):Promise<number>;

   
    getFailedBooking(userId:string,tutorId:string,selectedDate: Date,
        selectedSlot: { startTime: string; endTime: string }):Promise<IBooking | null>
    
}


