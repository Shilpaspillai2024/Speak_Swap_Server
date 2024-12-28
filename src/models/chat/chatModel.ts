import {Schema,model,Document, ObjectId } from "mongoose";

interface IParticipant{
    participantId:ObjectId;
    role:"user" | "tutor";
}

interface IChat extends Document{
    participants:IParticipant[];
    lastMessage?:{
        message:string;
        timestamp:Date;
     };
     createdAt:Date;
     updatedAt:Date;
}

const participantSchema =new Schema<IParticipant>({
    participantId:{
        type:Schema.Types.ObjectId,
        required:true,
        refPath:"participants.role"
    }
})