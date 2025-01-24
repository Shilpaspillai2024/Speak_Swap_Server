import mongoose,{Schema,Document} from "mongoose";

export interface ITransaction{
    amount:number;
    type:"credit" | "debit";
    description:string;
    creditedBy:string;
    date:Date;
}

export interface IWallet extends Document{
    tutorId:mongoose.Types.ObjectId;
    balance:number;
    transactions:ITransaction[];
}


const transactionSchema=new Schema<ITransaction>({
    amount:{
        type:Number,
        required:true,
    },
    type: {
        type: String,
        enum: ["credit", "debit"],
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      creditedBy:{
        type:String,
        required:true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
})


const walletSchema = new Schema<IWallet>({
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Tutor",
    },
    balance: {
      type: Number,
      default: 0,
    },
    transactions: [transactionSchema],
  });
  
 
  const Wallet = mongoose.model<IWallet>("Wallet", walletSchema);
  
  export default Wallet;