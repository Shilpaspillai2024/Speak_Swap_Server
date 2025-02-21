import { IUserWallet } from "../../../models/user/walletModel";

interface IUserWalletRepository{
    createWallet(userId:string):Promise<IUserWallet>;
    getWalletByUserId(userId:string):Promise<IUserWallet | null>;
    creditAmount(userId:string,amount:number,description:string):Promise<IUserWallet | null>;
    withdrawFunds(userId:string,amount:number):Promise<IUserWallet | null>;
}

export default IUserWalletRepository;