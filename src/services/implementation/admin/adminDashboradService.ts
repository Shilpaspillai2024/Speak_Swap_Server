import { IDashboardService } from "../../interfaces/admin/iadminDashboardService";
import { IDashboardRepository} from "../../../repositories/interfaces/admin/iadminDashboardRepository";
import { DashboardStats, BookingTrend,LanguageStat,RecentActivity} from "../../../repositories/interfaces/admin/iadminDashboardRepository";

export default class DashboardService implements IDashboardService{
    private dashboardRepository:IDashboardRepository;

    constructor(dashboardRepository:IDashboardRepository){
        this.dashboardRepository=dashboardRepository;
    }

     async getDashboardStats(): Promise<DashboardStats> {
        return this.dashboardRepository.getDashboardStats();
    }

    async getBookingTrends(months: number): Promise<BookingTrend[]> {
      return this.dashboardRepository.getBookingTrends(months);  
    }

     async getLanguageStats(): Promise<LanguageStat[]> {
        return this.dashboardRepository.getLanguageStats();

    }

   async getRecentActivity(limit: number): Promise<RecentActivity[]> {
       return this.dashboardRepository.getRecentActivity(limit)
   }

    async getDashboardData(): Promise<{ stats: DashboardStats; bookingTrend: BookingTrend[]; languageStats: LanguageStat[]; recentActivity: RecentActivity[]; }> {
        const [stats, bookingTrend, languageStats, recentActivity] = await Promise.all([
            this.getDashboardStats(),
            this.getBookingTrends(5),
            this.getLanguageStats(),
            this.getRecentActivity(5)
          ]);
          
          return {
            stats,
            bookingTrend,
            languageStats,
            recentActivity
          };
    }
}