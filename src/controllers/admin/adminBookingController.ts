import { CustomRequest } from "../../middlewares/adminAuthMiddleware";
import IAdminService from "../../services/implementation/admin/adminService";
import { Response } from "express";
import { HttpStatus } from "../../constants/httpStatus";

class AdminBookingController{

    private adminService:IAdminService;

    constructor(adminService:IAdminService){
        this.adminService=adminService;
    }


    async getAllBookings(req:CustomRequest,res:Response):Promise<void>{
        try {
            if (!req.admin) {
                res.status(HttpStatus.FORBIDDEN).json({ message: "Access denied Admins only" });
                return;
              }

              const bookings=await this.adminService.getAllBookings()
              res.status(HttpStatus.OK).json({
                message: "Bookings fetched successfully.",
                bookings,
              });

            
        } catch (error) {
            console.error("Error fetching bookings:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch bookings." });
        }
    }


     async getBookingDetails(req:CustomRequest,res:Response):Promise<void>{

        try {

            const {bookingId}=req.params;

            if (!req.admin) {
                res.status(HttpStatus.FORBIDDEN).json({ message: "Access denied Admins only" });
                return;
              }

              const booking=await this.adminService.getBookingDetails(bookingId)

              if (!booking) {
                res.status(HttpStatus.NOT_FOUND).json({ message: "Booking not found" });
                return;
              }

              res.status(HttpStatus.OK).json({
                message: "Booking details fetched successfully.",
                booking,
              });
            
        } catch (error) {
            console.error("Error fetching bookings:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch bookings." });
        }
     }

}

export default AdminBookingController;