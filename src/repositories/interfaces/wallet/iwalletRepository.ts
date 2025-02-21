import { IWallet } from "../../../models/tutor/walletModel";

interface IWalletRepository{
    createWallet(tutorId:string):Promise<IWallet>;
    getWalletByTutorId(tutorId:string):Promise<IWallet | null>;
    addFunds(tutorId:string,amount:number,description:string,creditedBy:string):Promise<IWallet | null>;
    withdrawFunds(tutorId:string,amount:number):Promise<IWallet | null>;
    deductFunds(tutorId:string,amount:number):Promise<IWallet | null>

}

export default IWalletRepository;