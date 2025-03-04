import { Response } from "express";
import { CustomRequest } from "../../middlewares/adminAuthMiddleware";
import { IDashboardService } from "../../services/interfaces/admin/iadminDashboardService";
import { HttpStatus } from "../../constants/httpStatus";
import { MESSAGES } from "../../constants/message";


export default class DashboardController {
    private dashboardService: IDashboardService;
    
    constructor(dashboardService: IDashboardService) {
      this.dashboardService = dashboardService;
    }
    
    async getDashboardData(req:CustomRequest, res: Response) {
      try {
        const dashboardData = await this.dashboardService.getDashboardData();
         res.status(HttpStatus.OK).json({
          success: true,
          data: dashboardData
        });
        return;
      } catch (error:unknown) {
        console.error('Error fetching dashboard data:', error);

        let errorMessage = MESSAGES.FETCH_DASHBOARD_ERROR;
      
        if (error instanceof Error) {
          errorMessage = error.message;
        }
      
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: errorMessage
        });
      
        return;
      }
    }
  }