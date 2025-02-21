import { Types } from "mongoose";

export interface DashboardStats{
    userCount:number;
    tutorCount:number;
    bookingCount:number;
    totalRevenue:number;
    pendingTutorApprovals:number;
    activeUsers:number;
    completedSessions:number;
}

export interface BookingTrend{
    month:string;
    bookings:number;
}


export interface LanguageStat{
    name:string;
    learners:number;
}

export interface RecentActivity {
    type: 'user' | 'tutor' | 'booking' | 'payment';
    message: string;
    timestamp: Date;
  }


  export interface IDashboardRepository{
    getDashboardStats():Promise<DashboardStats>;
    getBookingTrends(months:number):Promise<BookingTrend[]>;
    
    getLanguageStats(): Promise<LanguageStat[]>;
    getRecentActivity(limit: number): Promise<RecentActivity[]>;
  }
