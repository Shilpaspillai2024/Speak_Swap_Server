import { Tutor } from "../../../models/tutor/tutorModel";
import Wallet from "../../../models/tutor/walletModel";
import { IWallet,ITransaction } from "../../../models/tutor/walletModel";
import IWalletRepository from "../../interfaces/wallet/iwalletRepository";

class WalletRepository implements IWalletRepository{

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



  async withdrawFunds(tutorId: string, amount: number): Promise<IWallet | null> {
    const wallet=await Wallet.findOne({tutorId})

    if (!wallet) throw new Error("Wallet not found");
    if (wallet.balance < amount) throw new Error("Insufficient balance");


    const tutor=await Tutor.findById(tutorId);
    if(!tutor)throw new Error("Tutor not found")

     
    wallet.balance -=amount;
    wallet.transactions.push({
      amount,
            description: "Withdrawal",
            type: "debit",
            creditedBy:tutor.name,
            date: new Date(),
    });
    await wallet.save();
    return wallet;

  }


  async deductFunds(tutorId: string, amount: number): Promise<IWallet | null> {
    const wallet=await Wallet.findOne({tutorId})

    if (!wallet) throw new Error("Wallet not found");
    if (wallet.balance < amount) throw new Error("Insufficient balance");


    const tutor=await Tutor.findById(tutorId);
    if(!tutor)throw new Error("Tutor not found")

     
    wallet.balance -=amount;
    wallet.transactions.push({
      amount,
            description: "Debit for Cancellation",
            type: "debit",
            creditedBy:"Auto-Debit for Cancellation",
            date: new Date(),
    });
    await wallet.save();
    return wallet;
  }

}

export default WalletRepository;