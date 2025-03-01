import { IAdmin } from "../../../models/admin/adminModel";
import IAdminRepository from "../../../repositories/interfaces/admin/iadminRepository";
import { IUser } from "../../../models/user/userModel";
import { ITutor } from "../../../types/ITutor";
import { IBooking } from "../../../models/booking/bookingModel";
import IAdminService from "../../interfaces/admin/iadminService";

class AdminService implements IAdminService{

    private adminRepository:IAdminRepository;

    constructor(adminRepository:IAdminRepository){
        this.adminRepository=adminRepository
    }



    async findByEmail(email:string):Promise<IAdmin | null>{
try {
    const admin=await this.adminRepository.findByEmail(email);
    return admin
    
} catch (error) {
    throw new Error("Authentication failed");
    
}
       
    }


    async getAllUser():Promise<IUser[]>{

        try {
            return await this.adminRepository.getAllUser();
            
        } catch (error) {
            throw new Error("Something went wrong while fetching users");
        }

       
    }

    async updateUserStatus(userId:string,isActive:boolean):Promise<IUser | null>{
        try {
            return await this.adminRepository.updateUserStatus(userId,isActive);
            
        } catch (error) {
            throw new Error("Failed to update user status");
        }
       
    }



    async getTutors():Promise<ITutor[]>{
        try {
            return await this.adminRepository.getTutors();
            
        } catch (error) {
            return await this.adminRepository.getTutors();
        }
       

    }

    async getPendingTutors(): Promise<ITutor[]> {
        try {
            return await this.adminRepository.getPendingTutors();
        } catch (error) {
            console.error("Error in getPendingTutors:", error);
            throw new Error("Failed to fetch pending tutors");
        }
    }


     async getTutorPendingTutorById(tutorId: string): Promise<ITutor | null> {
        try {
            return await this.adminRepository.getPendingTutorById(tutorId)
            
        } catch (error) {
            console.error("Error in getPendingTutor:", error);
            throw new Error("Failed to fetch pending tutors");
        }
    }

    async tutorVerify(tutorId: string, status: string, isActive: boolean): Promise<ITutor | null> {
        try {
            return await this.adminRepository.tutorVerify(tutorId, status, isActive);
        } catch (error) {
            console.error("Error in tutorVerify:", error);
            throw new Error("Failed to verify tutor");
        }
    }

    async updateTutorStatus(tutorId: string, isActive: boolean): Promise<ITutor | null> {
        try {
            return await this.adminRepository.updateTutorStatus(tutorId, isActive);
        } catch (error) {
            console.error("Error in updateTutorStatus:", error);
            throw new Error("Failed to update tutor status");
        }
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