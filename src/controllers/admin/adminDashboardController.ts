import { Response } from "express";
import { CustomRequest } from "../../middlewares/adminAuthMiddleware";
import { IDashboardService } from "../../services/interfaces/admin/iadminDashboardService";

export default class DashboardController {
    private dashboardService: IDashboardService;
    
    constructor(dashboardService: IDashboardService) {
      this.dashboardService = dashboardService;
    }
    
    async getDashboardData(req:CustomRequest, res: Response) {
      try {
        const dashboardData = await this.dashboardService.getDashboardData();
         res.status(200).json({
          success: true,
          data: dashboardData
        });
        return;
      } catch (error:unknown) {
        console.error('Error fetching dashboard data:', error);

        let errorMessage = 'Failed to fetch dashboard data';
      
        if (error instanceof Error) {
          errorMessage = error.message;
        }
      
        res.status(500).json({
          success: false,
          message: errorMessage
        });
      
        return;
      }
    }
  }