import { CustomRequest } from "../../middlewares/adminAuthMiddleware";
import IAdminService from "../../services/implementation/admin/adminService";
import { Response } from "express";

class AdminBookingController{

    private adminService:IAdminService;

    constructor(adminService:IAdminService){
        this.adminService=adminService;
    }


    async getAllBookings(req:CustomRequest,res:Response):Promise<void>{
        try {
            if (!req.admin) {
                res.status(403).json({ message: "Access denied Admins only" });
                return;
              }

              const bookings=await this.adminService.getAllBookings()
              res.status(200).json({
                message: "Bookings fetched successfully.",
                bookings,
              });

            
        } catch (error) {
            console.error("Error fetching bookings:", error);
            res.status(500).json({ message: "Failed to fetch bookings." });
        }
    }


     async getBookingDetails(req:CustomRequest,res:Response):Promise<void>{

        try {

            const {bookingId}=req.params;

            if (!req.admin) {
                res.status(403).json({ message: "Access denied Admins only" });
                return;
              }

              const booking=await this.adminService.getBookingDetails(bookingId)

              if (!booking) {
                res.status(404).json({ message: "Booking not found" });
                return;
              }

              res.status(200).json({
                message: "Booking details fetched successfully.",
                booking,
              });
            
        } catch (error) {
            console.error("Error fetching bookings:", error);
            res.status(500).json({ message: "Failed to fetch bookings." });
        }
     }

}

export default AdminBookingController;