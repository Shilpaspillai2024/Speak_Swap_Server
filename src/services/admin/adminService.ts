import { IAdmin } from "../../models/admin/adminModel";
import AdminRepository from "../../repositories/admin/adminRepository";
import { IUser } from "../../models/user/userModel";
import { ITutor } from "../../types/ITutor";
import { IBooking } from "../../models/booking/bookingModel";


class AdminService{

    private adminRepository:AdminRepository;

    constructor(adminRepository:AdminRepository){
        this.adminRepository=adminRepository
    }



    async findByEmail(email:string):Promise<IAdmin | null>{
        const admin=await this.adminRepository.findByEmail(email);
        return admin
    }


    async getAllUser():Promise<IUser[]>{

        return await this.adminRepository.getAllUser();
    }

    async updateUserStatus(userId:string,isActive:boolean):Promise<IUser | null>{
        return await this.adminRepository.updateUserStatus(userId,isActive);
    }



    async getTutors():Promise<ITutor[]>{
        return await this.adminRepository.getTutors();

    }

    async getPendingTutors():Promise<ITutor[]>{
        return await this.adminRepository.getPendingTutors();

    }


    async tutorVerify(tutorId:string,status:string,isActive:boolean):Promise<ITutor | null>{
        return await this.adminRepository.tutorVerify(tutorId,status,isActive)
    }

    async updateTutorStatus(tutorId:string,isActive:boolean):Promise<ITutor | null>{
        return await this.adminRepository.updateTutorStatus(tutorId,isActive);
    }

    async getAllBookings():Promise<IBooking[]>{
        try {
            const bookings = await this.adminRepository.getAllBookings();
             return bookings;
        } catch (error) {
            throw new Error("Failed to fetch all bookings");
        }
        
    }

   async getBookingDetails(bookingId:string):Promise<IBooking | null>{
    try {
        const booking=await this.adminRepository.getBookingById(bookingId);
        return booking;
    } catch (error) {
        throw new Error("Failed to fetch booking details");
    }
   }
    
}


export default AdminService