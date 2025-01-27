import IWalletRepository from "../../../repositories/interfaces/wallet/iwalletRepository";
import { IWallet } from "../../../models/tutor/walletModel";
import IWalletService from "../../interfaces/wallet/iwalletService";

class WalletService implements IWalletService {
  private walletRepository: IWalletRepository;

  constructor(walletRepository: IWalletRepository) {
    this.walletRepository = walletRepository;
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
}

export default WalletService;
