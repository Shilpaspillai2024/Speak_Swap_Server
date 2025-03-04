import IWalletRepository from "../../../repositories/interfaces/wallet/iwalletRepository";
import { IWallet } from "../../../models/tutor/walletModel";
import IWalletService from "../../interfaces/wallet/iwalletService";
import { IUserWallet } from "../../../models/user/walletModel";
import IUserWalletRepository from "../../../repositories/interfaces/wallet/iuserWalletRepository";

class WalletService implements IWalletService {
  private walletRepository: IWalletRepository;
  private userWalletRepository:IUserWalletRepository;

  constructor(walletRepository: IWalletRepository,userWalletRepository:IUserWalletRepository) {
    this.walletRepository = walletRepository;
    this.userWalletRepository = userWalletRepository;
  }

  async createWallet(tutorId: string): Promise<IWallet> {
    return await this.walletRepository.createWallet(tutorId);
  }

  async creditTutorWallet(
    tutorId: string,
    amount: number,
    description: string,
    creditedBy:string
  ): Promise<IWallet> {
    let wallet = await this.walletRepository.getWalletByTutorId(tutorId);

    if (!wallet) {
      console.log(`Wallet not found for tutor ${tutorId}, creating a new one.`);
      wallet = await this.createWallet(tutorId);
    }

    const updatedWallet = await this.walletRepository.addFunds(
      tutorId,
      amount,
      description,
      creditedBy,
    );
    if (!updatedWallet) {
      throw new Error(`Failed to credit funds to wallet for tutor ${tutorId}`);
    }

    return updatedWallet;
  }

  async getWalletDetails(tutorId: string): Promise<IWallet | null> {
    return await this.walletRepository.getWalletByTutorId(tutorId);
  }

  async withdrawFunds(tutorId: string, amount: number): Promise<IWallet | null> {
    return await this.walletRepository.withdrawFunds(tutorId,amount)
  }

  async deductFunds(tutorId: string, amount: number): Promise<IWallet | null> {
    return await this.walletRepository.deductFunds(tutorId,amount)
  }







  // user wallet related service

  async createUserWallet(userId: string): Promise<IUserWallet> {
    return await this.userWalletRepository.createWallet(userId);
  }

  

  async getUserWalletDetails(userId: string,page:number,limit:number): Promise<{wallet:IUserWallet | null,totalTransactions:number}> {
    return await this.userWalletRepository.getWalletByUserId(userId,page,limit);
  }


   async getUserWallet(userId: string): Promise<IUserWallet | null> {
    return await this.userWalletRepository.getWallet(userId)
  }



  async creditUserWallet(userId: string, amount: number, description: string): Promise<IUserWallet> {
    let userWallet = await this.userWalletRepository.getWallet(userId);
  
    
    if (!userWallet) {
      console.log(`Wallet not found for user ${userId}. Creating a new one.`);
      userWallet = await this.userWalletRepository.createWallet(userId);
    }
  
   
    const updatedWallet = await this.userWalletRepository.creditAmount(userId, amount, description);
  
    if (!updatedWallet) {
      throw new Error(`Failed to credit amount to user ${userId}'s wallet`);
    }
  
    return updatedWallet;
  }
  
  async debitUserWallet(userId: string, amount: number): Promise<IUserWallet | null> {
    return await this.userWalletRepository.withdrawFunds(userId, amount);
  }
}

export default WalletService;
