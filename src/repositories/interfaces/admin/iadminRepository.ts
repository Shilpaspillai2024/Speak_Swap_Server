import { IAdmin } from "../../../models/admin/adminModel";
import { IUser } from "../../../models/user/userModel";
import { ITutor } from "../../../types/ITutor";
import { IBooking } from "../../../models/booking/bookingModel";

interface IAdminRepository{
    findByEmail(email:string):Promise<IAdmin|null>
    getAllUser():Promise<IUser[]>
    updateUserStatus(userId:string,isActive:boolean):Promise<IUser | null>
    getTutors():Promise<ITutor[]>;
    getPendingTutors():Promise<ITutor[]>;
    tutorVerify(tutorId:string,status:string,isActive:boolean):Promise<ITutor | null>
    updateTutorStatus(tutorId:string,isActive:boolean):Promise<ITutor | null>
    getAllBookings():Promise<IBooking[]>;
    getBookingById(bookingId:string):Promise<IBooking | null>;
    getPendingTutorById(tutorId:string):Promise<ITutor | null>;

}

export default IAdminRepository