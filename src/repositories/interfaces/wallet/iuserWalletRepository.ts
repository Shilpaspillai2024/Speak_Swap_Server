import { IUserWallet } from "../../../models/user/walletModel";

interface IUserWalletRepository{
    createWallet(userId:string):Promise<IUserWallet>;
    getWallet(userId:string):Promise<IUserWallet | null>;
    getWalletByUserId(userId:string,page:number,limit:number):Promise<{wallet:IUserWallet | null,totalTransactions:number}>;
    creditAmount(userId:string,amount:number,description:string):Promise<IUserWallet | null>;
    withdrawFunds(userId:string,amount:number):Promise<IUserWallet | null>;
}

export default IUserWalletRepository;