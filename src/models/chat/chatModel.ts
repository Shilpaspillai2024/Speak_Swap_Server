import mongoose,{Schema,model,Document, ObjectId } from "mongoose";
import { User } from "../user/userModel";
import { Tutor } from "../tutor/tutorModel";

mongoose.model('User', User.schema);
mongoose.model('Tutor', Tutor.schema);

interface IParticipant{
    participantId:ObjectId;
    role:"user" | "tutor";
    name:string;
    profilePhoto:string;
}

interface IChat extends Document{
    participants:IParticipant[];
    participantIds:string;
    lastMessage?:{
        message:string;
        timestamp:Date;
     };
     isActive:boolean;
     lastActivity:Date;
     unreadCount?:{
        participantId:ObjectId;
        count:number;
     }[];

     createdAt:Date;

     updatedAt:Date;
}

const participantSchema =new Schema<IParticipant>({
    participantId:{
        type:Schema.Types.ObjectId,
        required:true,
        

        ref: function (this: IParticipant): string {
            return this.role === 'user' ? 'User' : 'Tutor';
          }
    },role:{
        type:String,
        enum:["user","tutor"],
        required:true,
    },
});

const chatSchema =new Schema<IChat>({
    participants:{
        type:[participantSchema],
        required:true,
    },
    participantIds: {
        type: String,
        required: true,
        unique: true,  
      },
    lastMessage:{
        message:{type:String},
        timestamp:{type:Date},
    },
    isActive:{
        type:Boolean,
        default:true
    },
    lastActivity:{
        type:Date,
        default:Date.now
    },

    unreadCount:[{
        participantId:{
            type:Schema.Types.ObjectId,
            required:true
        },
        count:{
            type:Number,
            default:0
        }
    }]

    

},
{timestamps:true});

chatSchema.index({ participantIds: 1 });

const Chat =mongoose.model<IChat>("Chat",chatSchema);
export{Chat,IChat};