import UserWallet from "../../../models/user/walletModel";
import { IUserWallet,IUserTransaction } from "../../../models/user/walletModel";
import IUserWalletRepository from "../../interfaces/wallet/iuserWalletRepository";

class UserWalletRepository implements IUserWalletRepository{

    async createWallet(userId: string): Promise<IUserWallet> {
        const wallet =new UserWallet({
            userId,
            balance:0,
            transactions:[],
        });
        return await wallet.save();
    }

    async getWalletByUserId(userId: string,page:number,limit:number): Promise<{wallet:IUserWallet | null,totalTransactions:number}> {

      try {
       

        const skip=(page-1)*limit;
        const wallet=await UserWallet.findOne({userId}).lean();
        if(!wallet){
          return {wallet:null,totalTransactions:0}
        }


        const totalTransactions = wallet.transactions.length;
        const paginatedTransactions = wallet.transactions.slice(skip, skip + limit);


        return{
          wallet:{
            ...wallet,
           transactions: paginatedTransactions,
          }as IUserWallet,
          totalTransactions,
        }
     
        
      } catch (error) {
        console.log("wallet fetching error")
        return { wallet: null, totalTransactions: 0 };
      }
    }

    async getWallet(userId: string): Promise<IUserWallet | null> {
      return await UserWallet.findOne({userId})
    }

    async creditAmount(userId: string, amount: number, description: string): Promise<IUserWallet | null> {
        const wallet = await UserWallet.findOne({ userId });

        if (!wallet) throw new Error("Wallet not found");
    
        const transaction: IUserTransaction = {
          amount,
          type: "credit",
          description,
          date: new Date(),
        };
    
        wallet.balance += amount;
        wallet.transactions.push(transaction);
        await wallet.save();
        return wallet;
    }

    async withdrawFunds(userId: string, amount: number): Promise<IUserWallet | null> {
        const wallet = await UserWallet.findOne({ userId });
    
        if (!wallet) throw new Error("Wallet not found");
        if (wallet.balance < amount) throw new Error("Insufficient balance");
    
        wallet.balance -= amount;
        wallet.transactions.push({
          amount,
          type: "debit",
          description: "Withdrawal",
          date: new Date(),
        });
    
        await wallet.save();
        return wallet;
      }

}

export default UserWalletRepository;