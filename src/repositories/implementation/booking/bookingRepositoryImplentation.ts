import { BookingRepository } from "../../booking/bookingRepository";
import Booking from "../../../models/booking/bookingModel";
import { IBooking } from "../../../models/booking/bookingModel";

class BookingRepositoryImplementation implements BookingRepository{


    async createBooking(bookingData: IBooking): Promise<IBooking> {
        const booking = new Booking(bookingData);
          await booking.save();
              return booking;
    }

    async updateBookingOrderId(bookingId: string, orderId: string): Promise<IBooking | null> {
        console.log("orderId",orderId)
       return await Booking.findByIdAndUpdate(
        bookingId,
        {orderId},
        {new:true}
       );
    }

    async updateBookingPaymentStatus(bookingId: string, paymentStatus: string): Promise<IBooking | null> {
       const status=paymentStatus==='paid'? 'confirmed':'pending';
       
        return await Booking.findByIdAndUpdate(
            bookingId,
            {paymentStatus,status},
            {new:true}
        );
    }


    async getBookingById(bookingId: string): Promise<IBooking | null> {
        return await Booking.findById(bookingId).populate('tutorId','name')
    }


    async getBookedSlots(tutorId: string, selectedDay: string): Promise<{ startTime: string; endTime: string }[]> {
        const bookings = await Booking.find({
          tutorId,
          selectedDay,
          status: { $nin: ["pending","completed", "cancelled"] },
           
        });
    
        return bookings.map((booking) => ({
          startTime: booking.selectedSlot.startTime,
          endTime: booking.selectedSlot.endTime,
        }));
      }


}

export default BookingRepositoryImplementation;