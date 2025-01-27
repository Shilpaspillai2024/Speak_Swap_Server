import { CustomRequest } from "../../middlewares/authMiddleware";
import { Response } from "express";
import { IWallet } from "../../models/tutor/walletModel";
import IWalletService from "../../services/interfaces/wallet/iwalletService";

class WalletController {
  private walletService: IWalletService;

  constructor(walletSerivce: IWalletService) {
    this.walletService = walletSerivce;
  }

  async getWalletDetails(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user;

      if (!tutorId) {
        res.status(400).json({
          success: false,
          message: "Tutor ID is required",
        });
        return;
      }

      const walletDetails: IWallet | null =
        await this.walletService.getWalletDetails(tutorId);

      if (!walletDetails) {
        res.status(404).json({
          success: false,
          message: "Wallet not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: walletDetails,
      });
    } catch (error) {
      console.error("Error fetching wallet details:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export default WalletController;
