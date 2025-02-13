import mongoose,{Document,Schema} from "mongoose"

export interface ISession extends Document{
    bookingId:mongoose.Types.ObjectId;
    userId:mongoose.Types.ObjectId;
    tutorId:mongoose.Types.ObjectId;
    isSessionActive:boolean;
    startedAt?:Date;
    endedAt?:Date,
    selectedDate:Date;
}

const sessionSchema = new Schema<ISession>({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
        unique: true
    },
    tutorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tutor",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isSessionActive: {
        type: Boolean,
        default: false
    },
    startedAt: {
        type: Date
    },
    endedAt: {
        type: Date
    },
    selectedDate:{
        type:Date,
        required:true
    }
}, { timestamps: true });

const Session = mongoose.model<ISession>("Session", sessionSchema);
export default Session;