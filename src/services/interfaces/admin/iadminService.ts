import { IAdmin } from "../../../models/admin/adminModel";
import { IUser } from "../../../models/user/userModel";
import { ITutor } from "../../../types/ITutor";
import { IBooking } from "../../../models/booking/bookingModel";


interface IAdminService{
    findByEmail(email:string):Promise<IAdmin | null>
    getAllUser():Promise<IUser[]>
    updateUserStatus(userId:string,isActive:boolean):Promise<IUser | null>
    getTutors():Promise<ITutor[]>
    getPendingTutors():Promise<ITutor[]>
    tutorVerify(tutorId:string,status:string,isActive:boolean):Promise<ITutor | null>
    updateTutorStatus(tutorId:string,isActive:boolean):Promise<ITutor | null>
    getAllBookings():Promise<IBooking[]>
    getBookingDetails(bookingId:string):Promise<IBooking | null>
}

export default IAdminService;