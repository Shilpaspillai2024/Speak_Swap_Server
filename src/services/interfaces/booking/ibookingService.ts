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

  getUserBookings(userId: string,page:number,limit:number): Promise<{
    bookings:IBooking[],
    totalItems: number;
    currentPage: number;
    totalPages: number;
  }>;

  getTutorBookings(tutorId: string,page:number,limit:number): Promise<{bookings:IBooking[],total:number}>;

  updatePaymentStatus(bookingId:string,status:string,failureReason?:string):Promise<IBooking | null>

  verifyAndCreditWallet(
    bookingId: string,
    tutorId: string,
    paymentStatus: string,
    amount: number,
    creditedBy: string
  ): Promise<void>;



    getFailedBooking(userId:string,tutorId:string,selectedDate: Date,
      selectedSlot: { startTime: string; endTime: string }):Promise<IBooking | null>
  

     startSession(bookingId:string):Promise<IBooking | null>;

     completeSession(bookingId:string):Promise<IBooking | null>;

     cancelBooking(tutorId:string,bookingId:string):Promise<IBooking | null>;

   
     getTutorSessionStatics(tutorId:string):Promise<{
      upcomingSessions:number;
      completeSessions:number;
      cancelSessions:number;
     }>

     cancelBookingUser(bookingId:string,userId:string ,cancellationReason:string):Promise<IBooking | null>
     
}

export default IBookingService;
