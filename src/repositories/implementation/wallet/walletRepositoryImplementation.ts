import Wallet from "../../../models/tutor/walletModel";
import { IWallet,ITransaction } from "../../../models/tutor/walletModel";
import WalletRepository from "../../wallet/walletRepository";

class WalletRepositoryImplementation implements WalletRepository{

  async createWallet(tutorId: string): Promise<IWallet> {
      const walllet=new Wallet({
        tutorId,
        balance:0,
        transaction:[],
      });
      return await walllet.save();
  }

   async getWalletByTutorId(tutorId: string): Promise<IWallet | null> {
       return await Wallet.findOne({tutorId});
  }

  async addFunds(tutorId: string, amount: number, description: string,creditedBy:string): Promise<IWallet | null> {
      const wallet=await Wallet.findOne({tutorId});
      if (!wallet) throw new Error("Wallet not found");



      const transaction:ITransaction={
        amount,
        type:"credit",
        description,
        creditedBy,
        date:new Date(),
      };
      wallet.balance+=amount;
      wallet.transactions.push(transaction);
      await wallet.save();
      return wallet;
  }

}

export default WalletRepositoryImplementation;