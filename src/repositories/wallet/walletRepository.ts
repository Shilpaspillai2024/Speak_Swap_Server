import { IWallet } from "../../models/tutor/walletModel";

interface WalletRepository{
    createWallet(tutorId:string):Promise<IWallet>;
    getWalletByTutorId(tutorId:string):Promise<IWallet | null>;
    addFunds(tutorId:string,amount:number,description:string,creditedBy:string):Promise<IWallet | null>;

}

export default WalletRepository;