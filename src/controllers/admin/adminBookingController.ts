import { CustomRequest } from "../../middlewares/adminAuthMiddleware";
import IAdminService from "../../services/implementation/admin/adminService";
import { Response } from "express";
import { HttpStatus } from "../../constants/httpStatus";
import { MESSAGES } from "../../constants/message";

class AdminBookingController{

    private adminService:IAdminService;

    constructor(adminService:IAdminService){
        this.adminService=adminService;
    }


    async getAllBookings(req:CustomRequest,res:Response):Promise<void>{
        try {
            if (!req.admin) {
                res.status(HttpStatus.FORBIDDEN).json({ message:MESSAGES.ACCESS_DENIED });
                return;
              }

              const page=parseInt(req.query.page as string) || 1
              const limit=parseInt(req.query.limit as string) || 10

              const{bookings,totalBookings}=await this.adminService.getAllBookings(page,limit)

              const totalPages=Math.ceil(totalBookings/limit);
              res.status(HttpStatus.OK).json({
                message: "Bookings fetched successfully.",
                bookings,
                meta:{
                  totalItems:totalBookings,
                  totalPages,
                  currentPage:page,
                  itemsPerPage:limit
                }
              });

            
        } catch (error) {
            console.error("Error fetching bookings:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: MESSAGES.FETCH_BOOKINGS_ERROR });
        }
    }


     async getBookingDetails(req:CustomRequest,res:Response):Promise<void>{

        try {

            const {bookingId}=req.params;

            if (!req.admin) {
                res.status(HttpStatus.FORBIDDEN).json({ message:MESSAGES.ACCESS_DENIED});
                return;
              }

              const booking=await this.adminService.getBookingDetails(bookingId)

              if (!booking) {
                res.status(HttpStatus.NOT_FOUND).json({ message: MESSAGES.BOOKING_NOT_FOUND});
                return;
              }

              res.status(HttpStatus.OK).json({
                message: "Booking details fetched successfully.",
                booking,
              });
            
        } catch (error) {
            console.error("Error fetching bookings:", error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message:MESSAGES.FETCH_BOOKINGS_ERROR });
        }
     }

}

export default AdminBookingController;