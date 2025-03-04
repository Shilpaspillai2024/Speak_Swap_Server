import { CustomRequest } from "../../middlewares/authMiddleware";
import { Response } from "express";
import { IWallet } from "../../models/tutor/walletModel";
import IWalletService from "../../services/interfaces/wallet/iwalletService";
import { IUserWallet } from "../../models/user/walletModel";
import { HttpStatus } from "../../constants/httpStatus";
import { MESSAGES } from "../../constants/message";

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
        message: MESSAGES.INTERNAL_SERVER_ERROR,
        error: error instanceof Error ? error.message :MESSAGES.UNKNOWN_ERROR,
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
          message: error instanceof Error ? error.message : MESSAGES.INTERNAL_SERVER_ERROR,
      });
    }
  }



  // user wallet dettails



  async getUserWalletDetails(req: CustomRequest, res: Response): Promise<void> {
    try {
      const userId = req.user;

      const page=parseInt(req.query.page as string) || 1;
      const limit=parseInt(req.query.limit as string) || 6;

      if (!userId) {
        res.status(HttpStatus.BAD_REQUEST).json({
          success: false,
          message: "userId is required",
        });
        return;
      }

      const{wallet,totalTransactions}=await this.walletService.getUserWalletDetails(userId,page,limit)



      const totalPages=Math.ceil(totalTransactions/limit)
      if(!wallet){
        res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: "Wallet not found",
      });
      return;
      }

      res.status(HttpStatus.OK).json({
        success: true,
        data:{
          wallet,
          meta:{
            totalItems:totalTransactions,
            totalPages,
            currentPage:page,
            itemsPerPage:limit
          }
        } ,
      });
    } catch (error) {
      console.error("Error fetching wallet details:", error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: MESSAGES.INTERNAL_SERVER_ERROR,
        error: error instanceof Error ? error.message :MESSAGES.UNEXPECTED_ERROR,
      });
    }
  }



  async getUserWallet(req: CustomRequest, res: Response): Promise<void> {
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
        await this.walletService.getUserWallet(userId);

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
        message: MESSAGES.INTERNAL_SERVER_ERROR,
        error: error instanceof Error ? error.message :MESSAGES.UNKNOWN_ERROR,
      });
    }
  }
  
}

export default WalletController;
