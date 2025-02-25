import mongoose, { Schema,model,Document, ObjectId } from "mongoose";


interface IUser extends Document{
    _id:ObjectId;
    fullName:string;
    email:string;
    password:string;
    phone:string;
    isActive:boolean;
    country:string;
    nativeLanguage:string;
    knownLanguages:String;
    learnLanguage:string;
    learnProficiency:string;
    talkAbout:string;
    learningGoal:string;
    whyChat:string;
    profilePhoto:string;
    otp?:string;
    otpExpiration?:Date;
    isVerified:boolean;
    role: "user" | "tutor";
    isOnline:boolean;
    lastActive:Date;
    

}

const userSchema =new Schema<IUser>({
    fullName:{
        type:String,
       required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        
    },
    phone:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        default:false
    },
    country:{
        type:String,
       
    },
    nativeLanguage:{
        type:String,
        
    },
  

    knownLanguages:{
        type:[String],
       
    },

    learnLanguage:{
        type:String,
       
    },
    learnProficiency:{
        type:String,
       
    },
    talkAbout:{
        type:String,
      
    },
    learningGoal:{
        type:String,
        
    },
    whyChat:{
        type:String,
       
    },
    profilePhoto:{
        type:String,
       
    },
    otp:{
        type:String,
    },
    otpExpiration:{
        type:Date,
    },
    
    isVerified:{
        type:Boolean,
        default:false
    },
    role: {
        type: String,
        enum: ["user", "tutor"],
        default: "user",
      },
      
      isOnline: {
        type: Boolean,
        default: false
      },
      lastActive: {
        type: Date,
        default: Date.now
      }
    

})


const User =mongoose.model<IUser>('User',userSchema)

export {User,IUser}
