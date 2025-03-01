import { CustomRequest } from "../../middlewares/authMiddleware";
import { Response } from "express";
import { IWallet } from "../../models/tutor/walletModel";
import IWalletService from "../../services/interfaces/wallet/iwalletService";
import { IUserWallet } from "../../models/user/walletModel";
import { HttpStatus } from "../../constants/httpStatus";

class WalletController {
  private walletService: IWalletService;

  constructor(walletSerivce: IWalletService) {
    this.walletService = walletSerivce;
  }

  async getWalletDetails(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user;

      if (!tutorId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "Tutor ID is required",
        });
        return;
      }

      const walletDetails: IWallet | null =
        await this.walletService.getWalletDetails(tutorId);

      if (!walletDetails) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: "Wallet not found",
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: walletDetails,
      });
    } catch (error) {
      console.error("Error fetching wallet details:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }


  async withdrawFunds(req:CustomRequest,res:Response):Promise<void>{
    try {
      const tutorId=req.user;
      const {amount} =req.body;
      if (!tutorId) {
        res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Tutor ID is required" });
        return;
    }

    if (!amount || amount <= 0) {
      res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: "Invalid withdrawal amount" });
      return;
  }

  const updateWallet=await this.walletService.withdrawFunds(tutorId,amount)
             res.status(HttpStatus.OK).json({
    success: true,
    message: "Withdrawal successful",
    data: updateWallet,
      });
    } catch (error) {
      console.error("Error withdrawing funds:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }



  // user wallet dettails



  async getUserWalletDetails(req: CustomRequest, res: Response): Promise<void> {
    try {
      const userId = req.user;

      if (!userId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "userId is required",
        });
        return;
      }

      const walletDetails: IUserWallet | null =
        await this.walletService.getUserWalletDetails(userId);

      if (!walletDetails) {
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: "Wallet not found",
        });
        return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data: walletDetails,
      });
    } catch (error) {
      console.error("Error fetching wallet details:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default WalletController;
