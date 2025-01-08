import mongoose, { Schema,model,Document,ObjectId } from "mongoose";


interface IMessage extends Document{
    chatId:ObjectId;
    senderId:ObjectId;
    senderRole:"user"|"tutor";
    // reciepientId:ObjectId;
    // reciepientRole:"user"|"tutor";
    message:string;
    timestamp:Date;
    isRead:boolean;
}

const messageSchema = new Schema<IMessage>(
    {
      chatId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Chat",
      },
      senderId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: "senderRole",
      },
      senderRole: {
        type: String,
        enum: ["user", "tutor"],
        required: true,
      },

    //   reciepientId: {
    //     type: Schema.Types.ObjectId,
    //     required: true,
    //     refPath: "reciepientRole",
    //   },
    // reciepientRole: {
    //     type: String,
    //     enum: ["user", "tutor"],
    //     required: true,
    //   },
     
      message: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      isRead:{
        type:Boolean,
        default:false
      }
    },
    { timestamps: true }
  );
  
  const Message =mongoose.model<IMessage>("Message", messageSchema);
  
  export { Message, IMessage };
  