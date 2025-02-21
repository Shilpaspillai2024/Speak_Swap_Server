import mongoose,{Schema,Document} from "mongoose";

export interface IUserTransaction{
    amount:number;
    type:"credit" | "debit";
    description:string;
    date:Date;
}

export interface IUserWallet extends Document{
    userId:mongoose.Types.ObjectId;
    balance:number;
    transactions:IUserTransaction[];
}

const UserTransactionSchema = new Schema<IUserTransaction>({
    amount: { type: Number, required: true },
    type: { type: String, enum: ["credit", "debit"], required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
  });
  
  const UserWalletSchema = new Schema<IUserWallet>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0 },
    transactions: { type: [UserTransactionSchema], default: [] },
  });
  
  const UserWallet = mongoose.model<IUserWallet>("UserWallet", UserWalletSchema);
  export default UserWallet;