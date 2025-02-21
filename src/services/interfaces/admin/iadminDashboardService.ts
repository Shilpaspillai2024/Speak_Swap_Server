import { DashboardStats,BookingTrend,LanguageStat,RecentActivity } from "../../../repositories/interfaces/admin/iadminDashboardRepository";

export interface IDashboardService{
    getDashboardStats(): Promise<DashboardStats>;
    getBookingTrends(months: number): Promise<BookingTrend[]>;
   
    getLanguageStats(): Promise<LanguageStat[]>;
   getRecentActivity(limit: number): Promise<RecentActivity[]>;
   getDashboardData(): Promise<{
    stats: DashboardStats;
    bookingTrend: BookingTrend[];
    languageStats: LanguageStat[];
    recentActivity: RecentActivity[];
  }>;
}