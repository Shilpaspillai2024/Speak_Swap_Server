import { Admin, IAdmin } from "../../../models/admin/adminModel";
import IAdminRepository from "../../interfaces/admin/iadminRepository";
import { IUser, User } from "../../../models/user/userModel";
import { ITutor } from "../../../types/ITutor";
import { Tutor } from "../../../models/tutor/tutorModel";
import { IBooking } from "../../../models/booking/bookingModel";
import Booking from "../../../models/booking/bookingModel";

class AdminRepository implements IAdminRepository {

  async findByEmail(email: string): Promise<IAdmin | null> {
    const admin = await Admin.findOne({ email, role: "admin" });

    return admin;
  }
  async getAllUser(page:number,limit:number): Promise<{
    users:IUser[],
    totalUsers:number
  }> {

    const skip=(page-1)*limit
    const users = await User.find().skip(skip).limit(limit);

    const totalUsers=await User.countDocuments();
    return {users,totalUsers};
  }

  async updateUserStatus(
    userId: string,
    isActive: boolean
  ): Promise<IUser | null> {
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { isActive },
      {
        new: true,
      }
    );
    return updateUser;
  }

  async getTutors(page:number,limit:number): Promise<{tutors:ITutor[],totalTutors:number}> {

    const skip=(page-1)*limit;
    const tutors = await Tutor.find({status:"approved"}).skip(skip).limit(limit);
    const totalTutors=await Tutor.countDocuments();
    return {tutors,totalTutors};
  }

  async getPendingTutors(page:number,limit:number): Promise<{pendingTutors:ITutor[],total:number}> {
    const skip=(page-1)*limit
    const pendingTutors = await Tutor.find({ status: "pending" })
    .skip(skip)
    .limit(limit);

    const total=await Tutor.countDocuments({status:"pending"})
    return {pendingTutors,total};
  }

  async getPendingTutorById(tutorId: string): Promise<ITutor | null> {
    return await Tutor.findById(tutorId)
  }

  async tutorVerify(
    tutorId: string,
    status: string,
    isActive: boolean
  ): Promise<ITutor | null> {
    const verifyTutor = await Tutor.findByIdAndUpdate(
      tutorId,
      { status: status, isActive: isActive },
      { new: true }
    );

    return verifyTutor;
  }

  async updateTutorStatus(
    tutorId: string,
    isActive: boolean
  ): Promise<ITutor | null> {
    const updateTutor = await Tutor.findByIdAndUpdate(
      tutorId,
      { isActive },
      {
        new: true,
      }
    );
    return updateTutor;
  }

  async getAllBookings(page:number,limit:number): Promise<{bookings:IBooking[],totalBookings:number}> {
    try {
      let skip=(page-1)*limit
      const bookings = await Booking.find()
      .populate("tutorId")
      .populate("userId")
      .skip(skip)
      .limit(limit);

      const totalBookings=await Booking.countDocuments()
      return {bookings,totalBookings};
    } catch (error) {
      throw new Error("Failed to fetch bookings");
    }
  }



  async getBookingById(bookingId: string): Promise<IBooking | null> {
      try {
        const booking=await Booking.findById(bookingId).populate("tutorId").populate("userId");
        return booking;
        
      } catch (error) {
        throw new Error("Failed to fetch booking details");
      }
  }
}

export default AdminRepository;
