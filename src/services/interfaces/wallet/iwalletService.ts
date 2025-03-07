import { IWallet } from "../../../models/tutor/walletModel";
import { IUserWallet } from "../../../models/user/walletModel";

interface IWalletService {
  createWallet(tutorId: string): Promise<IWallet>;

  creditTutorWallet(
    tutorId: string,
    amount: number,
    description: string,
    creditedBy: string
  ): Promise<IWallet>;

  getWalletDetails(tutorId: string): Promise<IWallet | null>;
  withdrawFunds(tutorId:string,amount:number):Promise<IWallet | null>;
  deductFunds(tutorId:string,amount:number):Promise<IWallet | null>;
  

  /// user related wallet service interface

  createUserWallet(userId: string): Promise<IUserWallet>;
  getUserWallet(userId:string):Promise<IUserWallet | null>;
  getUserWalletDetails(userId: string,page:number,limit:number): Promise<{wallet:IUserWallet | null,totalTransactions:number}>;
  creditUserWallet(userId: string, amount: number, description: string): Promise<IUserWallet>;
  debitUserWallet(userId: string, amount: number): Promise<IUserWallet | null>;

 
}

export default IWalletService;
