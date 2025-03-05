import { IAdmin } from "../../../models/admin/adminModel";
import { IUser } from "../../../models/user/userModel";
import { ITutor } from "../../../types/ITutor";
import { IBooking } from "../../../models/booking/bookingModel";
import IBaseRepository from "../base/ibaseRepository";


interface IAdminRepository extends IBaseRepository<IAdmin>{
    findByEmail(email:string):Promise<IAdmin|null>
    getAllUser(page:number,limit:number):Promise<{users:IUser[],totalUsers:number}>
    updateUserStatus(userId:string,isActive:boolean):Promise<IUser | null>
    getTutors(page:number,limt:number):Promise<{tutors:ITutor[],totalTutors:number}>;
    getPendingTutors(page:number,limit:number):Promise<{pendingTutors:ITutor[],total:number}>;
    tutorVerify(tutorId:string,status:string,isActive:boolean):Promise<ITutor | null>
    updateTutorStatus(tutorId:string,isActive:boolean):Promise<ITutor | null>
    getAllBookings(page:number,limit:number):Promise<{bookings:IBooking[],totalBookings:number}>;
    getBookingById(bookingId:string):Promise<IBooking | null>;
    getPendingTutorById(tutorId:string):Promise<ITutor | null>;

}

export default IAdminRepository