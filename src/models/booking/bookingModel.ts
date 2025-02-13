import mongoose,{Document,Schema} from "mongoose";

export interface IBooking extends Document{
    userId:mongoose.Types.ObjectId;
    tutorId:mongoose.Types.ObjectId;
    selectedDate:Date;
    selectedSlot:{startTime:string,endTime:string};
    status:'pending' |'confirmed'|'completed'|'cancelled';
    sessionFee:number;
    paymentStatus:'paid'| 'pending' | 'failed'|'completed';
    bookingDate:Date;
    paymentId?:string;
    orderId?: string;
    
}


const bookingSchema=new Schema<IBooking>({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
         ref: 'User', required: true ,
    },
    tutorId:{
        type: mongoose.Schema.Types.ObjectId,
         ref: 'Tutor', required: true ,
    },
    selectedDate: { 
        type:Date, 
        required: true 
    },
  selectedSlot: { 
    type: Object,
     required: true 
    }, 
  status: {
     type: String, 
     enum: ['pending', 'confirmed', 'completed','cancelled'], 
     default: 'pending'
     },
  sessionFee: { 
    type: Number,
     required: true 
    },
  paymentStatus: { 
    type: String, 
    enum: ['paid', 'pending', 'failed','completed'], 
    default: 'pending'
 },
  bookingDate: { 
    type: Date, 
    default: Date.now 
},
  paymentId: { 
    type: String 
},
orderId: {
    type: String, 
  },


},{ timestamps: true });

const Booking = mongoose.model<IBooking>('Booking',bookingSchema);

export default Booking;

