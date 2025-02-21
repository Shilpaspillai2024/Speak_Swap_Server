import { IDashboardRepository } from "../../interfaces/admin/iadminDashboardRepository";
import { User } from "../../../models/user/userModel";
import { Tutor } from "../../../models/tutor/tutorModel";
import Booking from "../../../models/booking/bookingModel";
import { DashboardStats,RecentActivity,BookingTrend,LanguageStat} from "../../interfaces/admin/iadminDashboardRepository";



export default class AdminDashboardRepository implements IDashboardRepository{
    async getDashboardStats():Promise<DashboardStats> {
        const userCount= await User.countDocuments();
        const activeUsers=await User.countDocuments({isActive:true})


        const tutorCount=await Tutor.countDocuments({status:"approved"});
        const pendingTutorApprovals=await Tutor.countDocuments({status:"pending"});


        const bookingCount=await Booking.countDocuments({status:{$in:["pending","confirmed"]}});
        const completedSessions=await Booking.countDocuments({status:"completed"})
        const totalRevenue = await Booking.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$sessionFee' } } }
          ]).then(results => results[0]?.total || 0);
          
          return {
            userCount,
            tutorCount,
            bookingCount,
            totalRevenue,
            pendingTutorApprovals,
            activeUsers,
            completedSessions
          };

    }


    async getBookingTrends(months = 5):Promise<BookingTrend[]> {
        const today = new Date();
        const trends = [];
        
        for (let i = 0; i < months; i++) {
          const month = new Date(today);
          month.setMonth(today.getMonth() - i);
          
          const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
          const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0);
          
          const count = await Booking.countDocuments({
            bookingDate: { $gte: startOfMonth, $lte: endOfMonth }
          });
          
          trends.unshift({
            month: startOfMonth.toLocaleString('default', { month: 'short' }),
            bookings: count
          });
        }
        
        return trends;
      }


     
    
      async getLanguageStats():Promise<LanguageStat[]>{
        return await User.aggregate([
          { $group: {
              _id: '$learnLanguage',
              learners: { $count: {} }
            }
          },
          { $project: {
              _id: 0,
              name: '$_id',
              learners: 1
            }
          },
          { $sort: { learners: -1 } },
          { $limit: 5 }
        ]);
      }
    
      async getRecentActivity(limit:5): Promise<RecentActivity[]> {  
        const recentUsers = await User.find()
          .sort({ createdAt: -1 })
          .limit(limit)
          .then(users => users.map(user => ({
            type: 'user' as const,   
            message: `${user.fullName} joined the platform`,
            timestamp: new Date(parseInt(user._id.toString().substring(0, 8), 16) * 1000)
          })));
    
        const recentTutorApprovals = await Tutor.find({ status: 'approved' })
          .sort({ updatedAt: -1 })
          .limit(limit)
          .then(tutors => tutors.map(tutor => ({
            type: 'tutor' as const, 
            message: `${tutor.name} was approved as a tutor`,
            timestamp: tutor.updatedAt || new Date()
          })));
    
        const recentBookings = await Booking.find()
          .sort({ bookingDate: -1 })
          .limit(limit)
          .then(bookings => bookings.map(booking => ({
            type: 'booking' as const, 
            message: `New booking was created`,
            timestamp: booking.bookingDate
          })));
    
        const recentPayments = await Booking.find({ paymentStatus: 'completed' })
          .sort({ updatedAt: -1 })
          .limit(limit)
          .then(bookings => bookings.map(booking => ({
            type: 'payment' as const,   
            message: `$${booking.sessionFee} payment was processed`,
            timestamp: booking.bookingDate || new Date()
          })));
    
      
        return [...recentUsers, ...recentTutorApprovals, ...recentBookings, ...recentPayments]
          .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
          .slice(0, limit);
    }
    


}