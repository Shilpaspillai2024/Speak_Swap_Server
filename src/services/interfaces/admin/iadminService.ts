import { IAdmin } from "../../../models/admin/adminModel";
import { IUser } from "../../../models/user/userModel";
import { ITutor } from "../../../types/ITutor";
import { IBooking } from "../../../models/booking/bookingModel";


interface IAdminService{
    findByEmail(email:string):Promise<IAdmin | null>
    getAllUser(page:number,limit:number):Promise<{users:IUser[],totalUsers:number}>
    updateUserStatus(userId:string,isActive:boolean):Promise<IUser | null>
    getTutors(page:number,limit:number):Promise<{tutors:ITutor[],totalTutors:number}>
    getPendingTutors(page:number,limit:number):Promise<{pendingTutors:ITutor[],total:number}>
    tutorVerify(tutorId:string,status:string,isActive:boolean):Promise<ITutor | null>
    updateTutorStatus(tutorId:string,isActive:boolean):Promise<ITutor | null>
    getAllBookings(page:number,limit:number):Promise<{bookings:IBooking[],totalBookings:number}>
    getBookingDetails(bookingId:string):Promise<IBooking | null>
    getTutorPendingTutorById(tutorId:string):Promise<ITutor | null>
}

export default IAdminService;