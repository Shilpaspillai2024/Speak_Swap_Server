import { IWallet } from "../../../models/tutor/walletModel";

interface IWalletService {
  createWallet(tutorId: string): Promise<IWallet>;

  creditTutorWallet(
    tutorId: string,
    amount: number,
    description: string,
    creditedBy: string
  ): Promise<IWallet>;

  getWalletDetails(tutorId: string): Promise<IWallet | null>;
}

export default IWalletService;
