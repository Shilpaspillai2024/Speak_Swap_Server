import mongoose,{Document,Schema} from "mongoose";

export interface IBooking extends Document{
    userId:mongoose.Types.ObjectId;
    tutorId:mongoose.Types.ObjectId;
    selectedDate:Date;
    selectedSlot:{startTime:string,endTime:string};
    status:'pending' |'confirmed'|'in-progress' | 'completed'|'cancelled';
    sessionFee:number;
    paymentStatus:'paid'| 'pending' | 'failed'|'completed'|'refunded';
    failureReason?:string;
    cancellationReason?:string;
    bookingDate:Date;
    paymentId?:string;
    orderId?: string;
    sessionStartTime?:Date;
    sessionEndTime?:Date;
    duration?:number;
    cancelledAt?:Date;
    
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
     enum: ['pending', 'confirmed','in-progress', 'completed','cancelled','payment_failed'], 
     default: 'pending'
     },
  sessionFee: { 
    type: Number,
     required: true 
    },
  paymentStatus: { 
    type: String, 
    enum: ['paid', 'pending', 'failed','refunded'], 
    default: 'pending'
 },

 failureReason: {
  type: String
},
cancellationReason: {
  type: String
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
sessionStartTime:{

  type:Date,
},
sessionEndTime:{
  type:Date,
},
duration:{
  type:Number,
},
cancelledAt: {
  type: Date
}

},{ timestamps: true });

const Booking = mongoose.model<IBooking>('Booking',bookingSchema);

export default Booking;

